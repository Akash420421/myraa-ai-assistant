import { Device } from '@capacitor/device';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Clipboard } from '@capacitor/clipboard';
import { Browser } from '@capacitor/browser';

let torchStream: MediaStream | null = null;
let torchActive = false;

export interface MobileDeviceInfo {
  model?: string;
  platform?: string;
  operatingSystem?: string;
  osVersion?: string;
  manufacturer?: string;
  isVirtual?: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
}

/**
 * Mobile Device Info — Battery, OS version, hardware model.
 */
export async function getMobileDeviceInfo(): Promise<MobileDeviceInfo> {
  try {
    const info = await Device.getInfo();
    let batteryLevel: number | undefined;
    let isCharging: boolean | undefined;

    try {
      const battery = await Device.getBatteryInfo();
      batteryLevel = battery.batteryLevel !== undefined ? Math.round(battery.batteryLevel * 100) : undefined;
      isCharging = battery.isCharging;
    } catch {
      // Battery info not supported on some platforms / emulators
    }

    return {
      model: info.model,
      platform: info.platform,
      operatingSystem: info.operatingSystem,
      osVersion: info.osVersion,
      manufacturer: info.manufacturer,
      isVirtual: info.isVirtual,
      batteryLevel,
      isCharging,
    };
  } catch (error) {
    return {
      platform: 'web',
      operatingSystem: 'unknown',
      model: navigator.userAgent,
    };
  }
}

/**
 * Toggle Mobile Flashlight / Torch using MediaStream capabilities.
 */
export async function toggleTorch(enable?: boolean): Promise<{ ok: boolean; torchOn: boolean; message: string }> {
  try {
    const targetState = enable !== undefined ? enable : !torchActive;

    if (!targetState) {
      if (torchStream) {
        torchStream.getTracks().forEach((track) => track.stop());
        torchStream = null;
      }
      torchActive = false;
      return { ok: true, torchOn: false, message: 'Flashlight turned off.' };
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { ok: false, torchOn: false, message: 'Camera / Torch API is not supported on this device.' };
    }

    torchStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
      },
    });

    const track = torchStream.getVideoTracks()[0];
    const imageCapture = (track as any).applyConstraints
      ? track
      : null;

    if (imageCapture) {
      await (track as any).applyConstraints({
        advanced: [{ torch: true }],
      });
      torchActive = true;
      return { ok: true, torchOn: true, message: 'Flashlight turned on.' };
    }

    return { ok: false, torchOn: false, message: 'Torch mode constraint not supported on this camera.' };
  } catch (err: any) {
    torchActive = false;
    return { ok: false, torchOn: false, message: `Could not toggle flashlight: ${err?.message || err}` };
  }
}

/**
 * Camera Photo Capture for Multimodal Vision AI Analysis.
 * Captures a crisp photo frame from the mobile camera and returns base64.
 */
export async function captureCameraVisionFrame(): Promise<{ ok: boolean; imageBase64?: string; mimeType?: string; error?: string }> {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 75,
      width: 1024,
      height: 1024,
      allowEditing: false,
    });

    if (photo.base64String) {
      return {
        ok: true,
        imageBase64: photo.base64String,
        mimeType: `image/${photo.format || 'jpeg'}`,
      };
    }
    return { ok: false, error: 'No image data captured.' };
  } catch (err: any) {
    return { ok: false, error: `Camera capture cancelled or failed: ${err?.message || err}` };
  }
}

/**
 * Trigger Tactile Haptic Vibration.
 */
export async function triggerMobileHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
  try {
    if (type === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (type === 'warning') {
      await Haptics.notification({ type: NotificationType.Warning });
    } else if (type === 'error') {
      await Haptics.notification({ type: NotificationType.Error });
    } else if (type === 'light') {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (type === 'heavy') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  } catch {
    // Haptics unavailable on web preview
  }
}

/**
 * Schedule or send an instant Local Notification / Alarm.
 */
export async function scheduleMobileNotification(title: string, body: string, delaySeconds: number = 0): Promise<{ ok: boolean; message: string }> {
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      return { ok: false, message: 'Notification permission was denied by user.' };
    }

    const id = Math.floor(Math.random() * 1000000);
    const scheduleAt = delaySeconds > 0 ? new Date(Date.now() + delaySeconds * 1000) : undefined;

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: scheduleAt ? { at: scheduleAt } : undefined,
          sound: 'beep.wav',
          actionTypeId: '',
          extra: null,
        },
      ],
    });

    return {
      ok: true,
      message: delaySeconds > 0
        ? `Notification scheduled in ${delaySeconds} seconds.`
        : 'Notification sent to notification tray.',
    };
  } catch (err: any) {
    return { ok: false, message: `Failed to schedule notification: ${err?.message || err}` };
  }
}

/**
 * Open App Intent / Action (WhatsApp, Dialer, Maps, Browser).
 */
export async function executeMobileIntent(
  action: 'whatsapp' | 'call' | 'maps' | 'browser',
  params: { text?: string; phone?: string; query?: string; url?: string }
): Promise<{ ok: boolean; message: string }> {
  try {
    if (action === 'whatsapp') {
      const text = encodeURIComponent(params.text || '');
      const phone = params.phone ? params.phone.replace(/[^0-9+]/g, '') : '';
      const url = phone
        ? `https://wa.me/${phone}?text=${text}`
        : `https://wa.me/?text=${text}`;
      window.open(url, '_system');
      return { ok: true, message: `Opening WhatsApp with message: ${params.text || ''}` };
    }

    if (action === 'call') {
      if (!params.phone) return { ok: false, message: 'Phone number is required to make a call.' };
      const cleaned = params.phone.replace(/[^0-9+*#]/g, '');
      window.location.href = `tel:${cleaned}`;
      return { ok: true, message: `Opening phone dialer for ${cleaned}` };
    }

    if (action === 'maps') {
      const query = encodeURIComponent(params.query || 'nearby');
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, '_system');
      return { ok: true, message: `Opening navigation maps for '${params.query}'` };
    }

    if (action === 'browser') {
      const targetUrl = params.url?.startsWith('http') ? params.url : `https://${params.url || 'google.com'}`;
      await Browser.open({ url: targetUrl });
      return { ok: true, message: `Opened ${targetUrl} in mobile browser.` };
    }

    return { ok: false, message: `Unknown action '${action}'.` };
  } catch (err: any) {
    return { ok: false, message: `Failed to execute intent: ${err?.message || err}` };
  }
}

/**
 * Write to mobile clipboard.
 */
export async function writeMobileClipboard(text: string): Promise<{ ok: boolean; message: string }> {
  try {
    await Clipboard.write({ string: text });
    return { ok: true, message: 'Text copied to mobile clipboard.' };
  } catch (err: any) {
    return { ok: false, message: `Failed to copy: ${err?.message || err}` };
  }
}

/**
 * Read from mobile clipboard.
 */
export async function readMobileClipboard(): Promise<{ ok: boolean; text?: string; message?: string }> {
  try {
    const res = await Clipboard.read();
    return { ok: true, text: res.value };
  } catch (err: any) {
    return { ok: false, message: `Failed to read clipboard: ${err?.message || err}` };
  }
}
