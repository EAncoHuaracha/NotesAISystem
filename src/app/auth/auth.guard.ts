import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { RoutesNotesAI } from "../core/constants/routes.constants";
import { firebaseAuth } from "../core/config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const authGuard: CanActivateFn = async (route, state) => {
    const router = inject(Router)

    const user = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });

    if (user) {
        const token = await (user as any).getIdToken();
        if (token) {
            return true;
        }
    }

    router.navigate([RoutesNotesAI.LOGIN])
    return false
}