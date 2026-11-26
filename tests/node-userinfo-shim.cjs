const os = require("node:os");

// Some restricted Windows runners cannot resolve uv_os_get_passwd. This shim
// only supplies the non-sensitive username that tsx uses for its temp folder.
os.userInfo = () => ({
  username: process.env.USERNAME || "test-runner",
});
