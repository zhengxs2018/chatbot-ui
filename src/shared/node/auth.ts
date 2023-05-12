const USER_PASSWORD = import.meta.env.USER_PASSWORD || '';

const users: string[] = USER_PASSWORD ? USER_PASSWORD.split(',') : [];

/**
 * 检查密码是否正确
 */
export function checkPass(pass?: string) {
  return users.length > 0 ? pass && users.includes(pass) : true;
}
