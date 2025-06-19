import React from "react";
import { AgroclimatologicalFormComplete } from "./agroclimatological-form";
import SunshineTracker from "./sunshine-tracker";
import { SoilMoistureForm } from "./SoilMoistureForm/SoilMoistureForm";

const AgroclimatologicalPage = () => {  
    return (
        <main>
            {/* <AgroclimatologicalForm /> */}
            <SunshineTracker />
            <SoilMoistureForm/>
            <AgroclimatologicalFormComplete/>
        </main>
    );
};

export default AgroclimatologicalPage;