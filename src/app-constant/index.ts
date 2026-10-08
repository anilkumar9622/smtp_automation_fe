

const API_ENDPOINTS = {
     login: "/auth/login",
     changePassword: "/auth/change-password",
     emailTemplate: "/email-template",
     uploadImage: "/upload/image",
     uploadGallery: "/upload/gallery",
     incomingEmail: "/incoming-email",
     userList: "/user/list",
     userCreate: "/user/create",
     userUpdate: (userId: number) => `/user/update/${userId}`,
     userResetPassword: (userId: number) => `/user/reset-password/${userId}`,
     userStatus: (userId: number) => `/user/status/${userId}`,
}

// Roles allowed to open the User Management page.
const USER_MANAGER_ROLES = ["SUPER_ADMIN", "ADMIN"];

export {
    API_ENDPOINTS,
    USER_MANAGER_ROLES
}