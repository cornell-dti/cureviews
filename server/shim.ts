// The shim is too dynamic.
/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";

export type MeteorMethod = (...args: any[]) => any;

export class MeteorShim {
  private readonly _methods: Map<string, MeteorMethod> = new Map();

  private readonly _subscriptions: Map<string, MeteorMethod> = new Map();

  private _app: express.Application | null = null;

  async call<T = unknown>(key: string, ...args: any[]): Promise<T> {
    const method = this._methods.get(key);
    if (!method) throw new Error("Unknown method called...");
    return await method(...args);
  }

  registerApp(app: express.Application) { this._app = app; }

  publish(name: string, search: (...args: any[]) => any, routeInfo?: { url: string; httpMethod: string }) {
    this._subscriptions.set(name, search);

    if (routeInfo) {
      if (this._app) {
        // eslint-disable-next-line no-console
        console.log(`Registering API service on ${routeInfo.url}`);

        if (routeInfo.httpMethod === "get") {
          this._app.get(routeInfo.url, (req, res) => {
            let i = 0;
            let searching = true;
            const inputs = [];

            while (searching) {
              const param = req.params[`${i}`];
              if (!param) {
                searching = false;
                break;
              }

              inputs.push(param);
              i++;
            }

            search(...inputs).then((data: any) => res.status(200).send(data));
          });
        }
      } else {
        throw new Error(`Failed to register subscription ${name} as express is not initialized.`);
      }
    }
  }

  methods(methods: { [key: string]: MeteorMethod }) {
    Object.keys(methods).forEach((key) => this._methods.set(key, methods[key]));
  }

  bind() {
    if (!this._app) {
      throw new Error("No express app is registered to bind to.");
    }
    const app = this._app;

    {
      const keys = this._methods.keys();
      const methods = express.Router();
      methods.use(express.json());

      for (const key of keys) {
        console.log(`Binding Method: ${key}`);
        const urlKey = key.toLowerCase();
        const method = this._methods.get(key);
        if (!method) throw new Error("Invalid method!");

        methods.post(`/${urlKey}`, (req, res) => {
          const args = req.body.arguments;
          if (!args) return res.status(400).send({ message: "No arguments passed!" });
          if (!Array.isArray(args)) return res.status(400).send({ message: "Arguments are not an array!" });
          return method(...args).then((result: any) => res.status(200).send({ return: result }));
        });
      }
      app.use("/methods", methods);
    }

    {
      const subscriptions = express.Router();
      subscriptions.use(express.json());
      const subscriptionNames = this._subscriptions.keys();

      for (const name of subscriptionNames) {
        console.log(`Binding Subscription: ${name}`);
        const sub = this._subscriptions.get(name);
        if (!sub) throw new Error("Invalid method!");

        subscriptions.post(`/${name}`, (req, res) => {
          const args = req.body.arguments;
          if (!args) return res.status(400).send({ message: "No arguments passed!" });
          if (!Array.isArray(args)) return res.status(400).send({ message: "Arguments are not an array!" });
          return sub(...args).then((result: any) => res.status(200).send({ return: result }));
        });
      }
      this._app.use("/subscriptions", subscriptions);
    }
  }
}

export const Meteor = new MeteorShim();
