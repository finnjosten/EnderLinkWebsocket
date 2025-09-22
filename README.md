# EnderLink WebSocket
The **bridge** that powers EnderLink’s connection between **Minecraft** and **Discord** (or other platforms).  
This WebSocket server relays all chat and event data, making real-time communication possible.  

---

## ✅ Supported Environment
- **Node.js:** Latest LTS version recommended  
- **NPM:** Comes bundled with Node.js  
- Works on Linux, macOS, and Windows.

**Do not:**
- Run this WS in a Pterodactyl or Containerd (Docker) setup where it can not bind to `localhost` or `0.0.0.0 (all interfaces)`. Specially if you are hosting the Minecraft server on the same VPS/Machine.
- Set this up if you dont know what you are doing. If you dont understand it just use our own websocket! (`james.vacso.cloud:10000` or `ws.james.vacso.cloud`)

---

## 💡 What It Does
The WebSocket acts as the middleman between your Minecraft server and Discord bot.  
Whenever an event occurs, it travels like this:  
```
Minecraft → WebSocket → Discord Bot
Discord Bot → WebSocket → Minecraft
```
It’s lightweight, fast, and simple to host.

---

## 🔧 Requirements
You’ll need:
- [Git](https://git-scm.com/) for cloning the repository  
- [Node.js](https://nodejs.org/) and NPM for installing dependencies  

---

## 🛠️ Setup Guide
1. **Clone the Repository**  
   ```bash
   git clone https://github.com/finnjosten/EnderLinkWebsocket.git
   cd EnderLinkWebsocket
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Start the Server**  
   ```bash
   npm run dev
   ```
   By default, the server will start and listen on the configured port.
4. **(Optional but suggeted) Run with PM2**
   - Install PM2 `npm install -g pm2`
   - Start the server `pm2 start server.js --name EnderLinkWS`
   - Use PM2 commands to control the server `pm2 stop EnderLinkWS`|`pm2 logs EnderLinkWS`|`pm2 restart EnderLinkWS` and many more.
6. **(Optional) Change the Port**
   - Open `server.js`.
   - Locate the port configuration and adjust it as needed (line `7` & `8`).
   - Restart the server for the change to take effect.
7. **(Optional) Reverse Proxy with Nginx**
   - Only set this up if you have experience with Nginx and want a more advanced configuration.
   - For simple setups, running the WebSocket directly is recommended.

---

## 🎯 Tips

Keep the WebSocket running in the background using tools like pm2 or a systemd service for production environments.  
If hosting publicly, secure the connection (e.g., via WSS) for extra protection.  

---

## 🎉 Done!
Your EnderLink WebSocket is now online and ready to relay messages between Minecraft and Discord.  
Other setups: 
- Plugin [finnjosten/EnderLink](https://github.com/finnjosten/EnderLink/blob/main/README.md)
- Discord Bot [finnjosten/EnderLinkDiscord](https://github.com/finnjosten/EnderDiscord/blob/main/README.md)
