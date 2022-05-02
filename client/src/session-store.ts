export class SessionStore {
  get(key: string) {
    const item = localStorage.getItem(key);
    return !item ? undefined : JSON.parse(item);
  }

  set(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  setPersistent(items: { [key: string]: any }) {
    Object.entries(items).forEach(([key, value]) =>
      localStorage.setItem(key, JSON.stringify(value)),
    );
  }

  isAuthenticated() {
    const token = this.get("token");
    if (
      token &&
      token !== "" &&
      new Date(JSON.parse(atob(token.split(".")[1])).exp * 1000) > new Date()
    ) {
      return true;
    } else {
      return false;
    }
  }
}

export const Session = new SessionStore();
