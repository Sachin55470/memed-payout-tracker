import axios from "axios";
import { notifications } from "@mantine/notifications";


function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? "Could not reach the server";
  }
  return "Something went wrong";
}

export function showError(error: unknown) {
  notifications.show({ color: "red", title: "Error", message: getErrorMessage(error) });
}

export function showSuccess(message: string) {
  notifications.show({ color: "green", message });
}
