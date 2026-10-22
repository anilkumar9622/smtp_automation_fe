

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
     propertyList: "/property/list",
     propertyExpiry: (propertyCode: string) => `/property/expiry/${propertyCode}`,
     propertyExpiryBulk: "/property/expiry",
}

// Roles allowed to open the User Management page.
const USER_MANAGER_ROLES = ["SUPER_ADMIN", "ADMIN"];

// Roles allowed to open the Property Management page.
const PROPERTY_MANAGER_ROLES = ["SUPER_ADMIN"];

export {
    API_ENDPOINTS,
    USER_MANAGER_ROLES,
    PROPERTY_MANAGER_ROLES
}