import React from "react";
import { useEffect, useState } from "react";
import Profile from "./Profile";
import ProfileMobile from "./ProfileMobile";


export default function ProfileContainer(imgSrc: any) {
    const [width, setWidth] = useState(window.innerWidth);
    const breakpoint = 992;
    useEffect(() => {
        const handleResizeWindow = () => setWidth(window.innerWidth);
        // subscribe to window resize event "onComponentDidMount"
        window.addEventListener("resize", handleResizeWindow);
        return () => {
            // unsubscribe "onComponentDestroy"
            window.removeEventListener("resize", handleResizeWindow);
        };
    }, []);
    if (width > breakpoint) {
        return <Profile imgSrc={imgSrc} />
    }
    else {
        return <ProfileMobile imgSrc={imgSrc} />
    }

}