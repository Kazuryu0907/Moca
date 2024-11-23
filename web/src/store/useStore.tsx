import {create,createStore} from "zustand";
import { persist } from "zustand/middleware";


type State = {
    title: string,
    blue_teamName: string,
    orange_teamName: string,
    blue_setPoint: number,
    orange_setPoint: number,
    bo: string,
}

type Action = {
    updateTitle: (title: State["title"]) => void,
    updateBlueTeamName: (blue_teamName: State["blue_teamName"]) => void,
    updateOrangeTeamName: (orange_teamName: State["orange_teamName"]) => void,
    updateBlueSetPoint: (blue_setPoint: State["blue_setPoint"]) => void,
    updateOrangeSetPoint: (orange_setPoint: State["orange_setPoint"]) => void,
    updateBo: (bo: State["bo"]) => void,
}

export const useControllerStore = create<State & Action>()(
    persist((set) => ({
        title: "",
        blue_teamName: "",
        orange_teamName: "",
        blue_setPoint: 0,
        orange_setPoint: 0,
        bo: "",
        updateTitle: (title) => set({title:title}),
        updateBlueTeamName: (blue_teamName) => set({blue_teamName:blue_teamName}),
        updateOrangeTeamName: (orange_teamName) => set({orange_teamName:orange_teamName}),
        updateBlueSetPoint: (blue_setPoint) => set({blue_setPoint:blue_setPoint}),
        updateOrangeSetPoint: (orange_setPoint) => set({orange_setPoint:orange_setPoint}),
        updateBo: (bo) => set({bo:bo}),
    }),
    {
        name: "controller-storage",
    }),
);

export const controllerStore = createStore<State & Action>()((set) => ({
    title: "",
    blue_teamName: "",
    orange_teamName: "",
    blue_setPoint: 0,
    orange_setPoint: 0,
    bo: "",
    updateTitle: (title) => set({title:title}),
    updateBlueTeamName: (blue_teamName) => set({blue_teamName:blue_teamName}),
    updateOrangeTeamName: (orange_teamName) => set({orange_teamName:orange_teamName}),
    updateBlueSetPoint: (blue_setPoint) => set({blue_setPoint:blue_setPoint}),
    updateOrangeSetPoint: (orange_setPoint) => set({orange_setPoint:orange_setPoint}),
    updateBo: (bo) => set({bo:bo}),
}));
