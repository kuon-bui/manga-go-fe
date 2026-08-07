const AUTHORIZATION_CONFLICT_MESSAGES: Readonly<Record<string, string>> = {
  ROLE_IN_USE: 'Role này vẫn đang được gán cho người dùng. Hãy gỡ role trước khi xóa.',
  SELF_MANAGE_REQUIRED: 'Bạn không thể tự gỡ quyền quản lý role của chính mình.',
  LAST_ROLE_MANAGER: 'Hệ thống phải luôn còn ít nhất một người có quyền quản lý role.',
  AUTHORIZATION_STATE_CHANGED:
    'Dữ liệu phân quyền đã thay đổi. Hãy tải lại và xác nhận lại thao tác.',
};

export function authorizationErrorMessage(code: string | undefined, fallback: string): string {
  return (code && AUTHORIZATION_CONFLICT_MESSAGES[code]) || fallback;
}
