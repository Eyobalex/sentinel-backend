import Settings, { ISettings } from "../models/Settings";
import { restartCronJobs } from "./cronService";

export const getSettings = async (): Promise<ISettings> => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
    await settings.save();
  }
  return settings;
};

export const updateSettings = async (
  data: Partial<ISettings>
): Promise<ISettings> => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings(data);
  } else {
    if (data.alertEmail) settings.alertEmail = data.alertEmail;
    if (data.cleanupSchedule) settings.cleanupSchedule = data.cleanupSchedule;
    if (data.batchAuditSchedule)
      settings.batchAuditSchedule = data.batchAuditSchedule;
  }
  await settings.save();

  // Restart cron jobs if schedule changed
  if (data.cleanupSchedule || data.batchAuditSchedule) {
    restartCronJobs();
  }

  return settings;
};
