import prisma from '../config/db';

const NON_ADMIN_ROLES = ['USER', 'STUDENT']; // STUDENT kept for legacy

export const getRoles = async () => {
  return await prisma.role.findMany({ orderBy: { name: 'asc' } });
};

export const getAdminRoles = async () => {
  return await prisma.role.findMany({
    where: {
      is_active: true,
      NOT: { name: { in: NON_ADMIN_ROLES } }
    },
    orderBy: { name: 'asc' }
  });
};

export const getRoleById = async (id: string) => {
  return await prisma.role.findUnique({ where: { id } });
};

export const createRole = async (data: { name: string; description?: string; permissions?: any; is_active?: boolean }) => {
  return await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      is_active: data.is_active !== undefined ? data.is_active : true
    }
  });
};

export const updateRole = async (id: string, data: { name?: string; description?: string; permissions?: any; is_active?: boolean }) => {
  const updateData: any = { name: data.name, description: data.description, permissions: data.permissions };
  if (data.is_active !== undefined) updateData.is_active = data.is_active;

  return await prisma.role.update({
    where: { id },
    data: updateData
  });
};

export const toggleRoleStatus = async (id: string, is_active: boolean) => {
  return await prisma.role.update({
    where: { id },
    data: { is_active }
  });
};

export const deleteRole = async (id: string) => {
  // Check if role is assigned to any users
  const usersWithRole = await prisma.user.count({ where: { role_id: id } });
  if (usersWithRole > 0) {
    throw new Error(`Cannot delete this role because there are ${usersWithRole} accounts using it. Please move these accounts to another role first.`);
  }

  await prisma.role.delete({ where: { id } });
};
