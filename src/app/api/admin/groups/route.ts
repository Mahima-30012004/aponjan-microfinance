import { authorizeRoles } from "@/lib/authorize";
import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authorization = await authorizeRoles(request, ["ADMIN"]);

    if ("response" in authorization) {
      return authorization.response;
    }

    const [groups, customers] = await Promise.all([
      prisma.group.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          teamLeader: {
            select: {
              id: true,
              fullName: true,
            },
          },
          members: {
            where: { status: "ACTIVE" },
            select: {
              customer: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.customer.findMany({
        where: {
          user: {
            status: "ACTIVE",
            role: {
              in: ["CUSTOMER", "TEAM_LEADER"],
            },
          },
        },
        select: {
          id: true,
          fullName: true,
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          fullName: "asc",
        },
      }),
    ]);

    return NextResponse.json({ success: true, groups, customers });
  } catch (error) {
    console.error("Group list error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load groups and customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await authorizeRoles(request, ["ADMIN"]);

    if ("response" in authorization) {
      return authorization.response;
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid group request" },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;
    const name = normalizeName(input.name);
    const teamLeaderId =
      typeof input.teamLeaderId === "string" ? input.teamLeaderId : "";
    const memberIds = Array.isArray(input.memberIds)
      ? input.memberIds.filter(
          (memberId): memberId is string =>
            typeof memberId === "string" && memberId.length > 0
        )
      : [];

    if (!name || name.length > 100 || !teamLeaderId) {
      return NextResponse.json(
        {
          success: false,
          message: "A group name and registered customer as group leader are required",
        },
        { status: 400 }
      );
    }

    const customerIds = [...new Set([teamLeaderId, ...memberIds])];
    const activeCustomers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        user: { status: "ACTIVE" },
      },
      select: { id: true },
    });

    if (activeCustomers.length !== customerIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "The group leader and members must be active customer accounts",
        },
        { status: 400 }
      );
    }

    const group = await prisma.$transaction(async (transaction) => {
      const createdGroup = await transaction.group.create({
        data: {
          name,
          teamLeaderId,
          createdById: authorization.user.userId,
          members: {
            createMany: {
              data: customerIds.map((customerId) => ({ customerId })),
            },
          },
        },
        select: {
          id: true,
          name: true,
          teamLeader: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      await transaction.user.update({
        where: {
          id: (
            await transaction.customer.findUniqueOrThrow({
              where: { id: teamLeaderId },
              select: { userId: true },
            })
          ).userId,
        },
        data: { role: "TEAM_LEADER" },
      });

      return createdGroup;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Group created and the selected customer assigned as team leader",
        group,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Group creation error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create group" },
      { status: 500 }
    );
  }
}
