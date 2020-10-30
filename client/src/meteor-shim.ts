import axios, { AxiosInstance } from "axios";

export class MeteorShim {
  private _axios!: AxiosInstance;

  startup(cb: () => void) { cb(); }

  _subscribe<T = any>(name: string, params: any[], cb: (err: Error | null, data?: T) => void) {
    this._axios
      .post(`/subscriptions/${name}`, { arguments: params })
      .then(response => cb(null, response.data.return))
      .catch(err => cb(err));
  }

  subscribe(name: string, ...args: any[]) {
    this._subscribe(name, args.slice(0, -1), args[args.length - 1]);
  }

  setup() { this._axios = axios.create({ baseURL: '', timeout: 120_000 }); }

  call(name: string, ...args: any[]) {
    const cb = args[args.length - 1];
    this._axios
      .post(`/methods/${name}`, { arguments: args.slice(0, -1) })
      .then(response => cb(null, response.data.return))
      .catch(err => cb(err));
  }
}

export const Meteor = new MeteorShim();
