// components/LogoutButton.tsx
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from 'lucide-react';

const LogoutButton = () => {
  const { logout, confirmLogout, cancelLogout, showLogoutDialog } = useAuth();

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={logout} // This now shows the dialog
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

      <AlertDialog open={showLogoutDialog} onOpenChange={cancelLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of your account and will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLogout}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LogoutButton;