import prisma from '../config/db';

const NON_ADMIN_ROLE_NAMES = ['USER', 'STUDENT'];

export const getUsers = async (filters: { roleId?: string, search?: string }) => {
    const where: any = {};
    if (filters.roleId) {
        where.role_id = filters.roleId;
    }
    if (filters.search) {
        where.OR = [
            { username: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
            { full_name: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    return await prisma.user.findMany({
        where,
        select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            department: true,
            role: true,
            is_active: true,
            last_login: true,
            created_at: true,
        },
        orderBy: { created_at: 'desc' }
    });
};

export const createUser = async (data: any) => {
    let resolvedRole: any = null;
    
    if (data.role_id) {
        resolvedRole = await prisma.role.findUnique({ where: { id: data.role_id } });
    } else if (data.role_name) {
        resolvedRole = await prisma.role.findUnique({ where: { name: data.role_name } });
    }

    if (resolvedRole && NON_ADMIN_ROLE_NAMES.includes(resolvedRole.name)) {
        throw new Error(`Invalid data: Role "${resolvedRole.name}" is not allowed to be assigned to admin accounts.`);
    }

    return await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password_hash: data.password, // Ideally hashed before service or in service
            full_name: data.full_name,
            department: data.department || null,
            is_active: data.is_active !== undefined ? data.is_active : true,
            role: resolvedRole ? { connect: { id: resolvedRole.id } } : undefined
        },
        select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            department: true,
            role: true,
            is_active: true,
            last_login: true,
            created_at: true,
        }
    });
};

export const getUserById = async (id: string) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            department: true,
            role: true,
            is_active: true,
            last_login: true,
            created_at: true,
        },
    });
};

export const updateUser = async (id: string, data: any) => {
    const updateData: any = {};
    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.department !== undefined) updateData.department = data.department;

    if (data.role_id) {
        const resolvedRole = await prisma.role.findUnique({ where: { id: data.role_id } });
        if (resolvedRole && NON_ADMIN_ROLE_NAMES.includes(resolvedRole.name)) {
            throw new Error(`Invalid data: Role "${resolvedRole.name}" is not allowed to be assigned to admin accounts.`);
        }
        updateData.role = { connect: { id: data.role_id } };
    } else if (data.role_name) {
        const role = await prisma.role.findUnique({ where: { name: data.role_name } });
        if (role) {
            if (NON_ADMIN_ROLE_NAMES.includes(role.name)) {
                throw new Error(`Invalid data: Role "${role.name}" is not allowed to be assigned to admin accounts.`);
            }
            updateData.role = { connect: { id: role.id } };
        }
    }

    return await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            department: true,
            role: true,
            is_active: true,
            last_login: true,
            created_at: true,
        },
    });
};

export const deleteUser = async (id: string) => {
    return await prisma.user.delete({ where: { id } });
};

export const updateUserStatus = async (id: string, is_active: boolean) => {
    return await prisma.user.update({
        where: { id },
        data: { is_active },
        select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            department: true,
            role: true,
            is_active: true,
        },
    });
};
