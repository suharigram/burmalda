import { sessionUser } from '../../../../lib/auth.js';
import { apiError, json } from '../../../../lib/http.js';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const user = await sessionUser(request);
    if (!user) return json(401, { message: 'Sign in to access your account.' });
    return json(200, {
      downloads: [
        { id: 'fpu-linux', name: 'FPU 1100 Linux Driver', version: '1.0.0', platform: 'Linux · Ubuntu 24.04 / RHEL 9', size: '480 MB', url: process.env.FPU_LINUX_DRIVER_URL || '' },
        { id: 'fpu-firmware', name: 'FPU Platform Firmware', version: '2.4.1', platform: 'FPU Apollon 1100 · FlowSystem R systems', size: '86 MB', url: process.env.FPU_FIRMWARE_URL || '' },
        { id: 'fpu-sdk', name: 'FPU 1100 Developer SDK', version: '1.2.0', platform: 'Linux · x86_64', size: '1.2 GB', url: process.env.FPU_SDK_URL || '' },
      ],
    });
  } catch (error) {
    return apiError(error);
  }
}
