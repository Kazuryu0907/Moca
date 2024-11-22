import { Hono } from 'hono';
import { serve } from "@hono/node-server"
import {serveStatic} from "@hono/node-server/serve-static";


export const start_server = () => {
    const app = new Hono();
    console.log(__dirname);
    app.use("/static/*",serveStatic({path:"./dist"}))
    app.get("/test",(c) => c.json({message:"Hello World"}));
    app.use("/favicon.ico",serveStatic({path:"./favicon.ico"}))
    app.use("/",serveStatic({path:"./dist/index.html"}))
    app.use("*",serveStatic({root:"./dist"}))

    serve({
        fetch: app.fetch,
        port: 5173,
    });
}