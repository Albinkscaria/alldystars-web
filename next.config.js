/** @type {import('next').NextConfig} */
const nextConfig = {
	// Next.js blocks dev-server requests (JS chunks, HMR websocket) from any
	// origin other than localhost by default, to prevent DNS-rebinding
	// attacks. That's exactly what broke the site when opened from another
	// device on the LAN via this machine's network IP — chunks silently
	// 403'd and the HMR socket failed, so React never fully hydrated (the
	// preloader's pure-CSS text animation played out, but its JS-driven
	// percentage counter never started). Allow this machine's current LAN
	// IP explicitly so phones/other devices on the same network can load
	// the dev server. If the IP changes (e.g. DHCP reassigns it), add the
	// new one here too.
	allowedDevOrigins: ['192.168.1.69'],
};

module.exports = nextConfig;
