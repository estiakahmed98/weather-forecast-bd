import React from "react";
import { AgroclimatologicalFormComplete } from "./agroclimatological-form";
import SunshineTracker from "./sunshine-tracker";

const AgroclimatologicalPage = () => {
    return (
        <main>
            {/* <AgroclimatologicalForm /> */}
            <SunshineTracker />
            <AgroclimatologicalFormComplete/>
        </main>
    );
};

export default AgroclimatologicalPage;