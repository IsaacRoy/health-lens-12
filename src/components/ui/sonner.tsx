import { useTheme } from "next-themes"

type ToasterProps = React.ComponentProps<any>

// Disabled toast function - no-op
const toast = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
  promise: () => {},
  custom: () => {},
  message: () => {},
  loading: () => {},
  dismiss: () => {},
}

const Toaster = ({ ...props }: ToasterProps) => {
  // Return null to completely hide the toaster
  return null
}

export { Toaster, toast }
