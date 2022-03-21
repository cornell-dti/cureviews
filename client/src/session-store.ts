export class SessionStore {
  get(key: string) {
    const item = localStorage.getItem(key);
    return !item ? undefined : JSON.parse(item);
  }

  set(key: string, data: any) { localStorage.setItem(key, JSON.stringify(data)); }

  setPersistent(items: { [key: string]: any }) {
    Object.entries(items).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
  }

  getToken() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    const parsedToken = JSON.parse(token);

    if (parsedToken.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem("token");
      return null;
    }

    return token;
  }
}

export const Session = new SessionStore();
