import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      // 设置 '@' 别名指向 'src' 目录
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [vue()],
  server: {
    host: "0.0.0.0", // 设置为0.0.0.0可以使服务器外部可访问
    port: 4066, // 设置本地开发服务器的端口号为4066
    open: true, // 自动在浏览器中打开
    https: false, // 是否开启https，这里设置为false，用http协议
  },
});
