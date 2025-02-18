import { Command, UpdateWAMSettingCommand } from "@workadventure/map-editor";
import { get, Unsubscriber } from "svelte/store";
import { EditMapCommandMessage } from "@workadventure/messages";
import pLimit from "p-limit";
import debug from "debug";
import merge from "lodash/merge";
import type { RoomConnection } from "../../../Connection/RoomConnection";
import type { GameScene } from "../GameScene";
import {
    mapEditorAskToClaimPersonalAreaStore,
    mapEditorModeStore,
    mapEditorSelectedToolStore,
    mapEditorVisibilityStore,
} from "../../../Stores/MapEditorStore";
import { mapEditorActivated, mapEditorActivatedForThematics } from "../../../Stores/MenuStore";
import { localUserStore } from "../../../Connection/LocalUserStore";
import { AreaEditorTool } from "./Tools/AreaEditorTool";
import type { MapEditorTool } from "./Tools/MapEditorTool";
import { FloorEditorTool } from "./Tools/FloorEditorTool";
import { EntityEditorTool } from "./Tools/EntityEditorTool";
import { WAMSettingsEditorTool } from "./Tools/WAMSettingsEditorTool";
import { FrontCommandInterface } from "./Commands/FrontCommandInterface";
import { FrontCommand } from "./Commands/FrontCommand";
import { TrashEditorTool } from "./Tools/TrashEditorTool";
import { ExplorerTool } from "./Tools/ExplorerTool";
import { CloseTool } from "./Tools/CloseTool";
import { UpdateAreaFrontCommand } from "./Commands/Area/UpdateAreaFrontCommand";

export enum EditorToolName {
    AreaEditor = "AreaEditor",
    FloorEditor = "FloorEditor",
    EntityEditor = "EntityEditor",
    WAMSettingsEditor = "WAMSettingsEditor",
    TrashEditor = "TrashEditor",
    ExploreTheRoom = "ExploreTheRoom",
    CloseMapEditor = "CloseMapEditor",
}

const logger = debug("map-editor");

export class MapEditorModeManager {
    private scene: GameScene;

    /**
     * Is user currently in Editor Mode
     */
    private active: boolean;

    /**
     * Tools that we can work with inside Editor
     */
    private editorTools: Record<EditorToolName, MapEditorTool>;

    /**
     * What tool are we using right now
     */
    private activeTool?: EditorToolName;
    /**
     * Last tool used before closing map editor
     */
    private lastlyUsedTool?: EditorToolName;

    /**
     * We are making use of CommandPattern to implement an Undo-Redo mechanism
     */
    private localCommandsHistory: FrontCommand[];

    /**
     * Commands sent by us that are still to be acknowledged by the server
     */
    private pendingCommands: FrontCommand[];
    /**
     * Which command was called most recently
     */
    private currentCommandIndex: number;

    private mapEditorModeUnsubscriber!: Unsubscriber;

    private ctrlKey?: Phaser.Input.Keyboard.Key;
    private shiftKey?: Phaser.Input.Keyboard.Key;

    private isReverting: Promise<void> = Promise.resolve();

    constructor(scene: GameScene) {
        this.scene = scene;

        this.ctrlKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        this.shiftKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.localCommandsHistory = [];
        this.pendingCommands = [];
        this.currentCommandIndex = -1;

        this.active = false;

        const areaEditorTool = new AreaEditorTool(this);

        this.editorTools = {
            [EditorToolName.AreaEditor]: areaEditorTool,
            [EditorToolName.EntityEditor]: new EntityEditorTool(this),
            [EditorToolName.FloorEditor]: new FloorEditorTool(this),
            [EditorToolName.WAMSettingsEditor]: new WAMSettingsEditorTool(this),
            [EditorToolName.TrashEditor]: new TrashEditorTool(this, areaEditorTool),
            [EditorToolName.ExploreTheRoom]: new ExplorerTool(this, this.scene),
            [EditorToolName.CloseMapEditor]: new CloseTool(),
        };
        this.activeTool = undefined;
        this.lastlyUsedTool = undefined;

        this.subscribeToStores();
        this.subscribeToGameMapFrontWrapperEvents();

        this.currentRunningCommand = this.scene.getGameMapFrontWrapper().initializedPromise.promise;
    }

    public update(time: number, dt: number): void {
        this.currentlyActiveTool?.update(time, dt);
    }

    private currentRunningCommand: Promise<void>;

    /**
     * Creates new Command object from given command config and executes it
     * @param command what to execute
     *
     */
    public async executeCommand(
        command: (Command & FrontCommandInterface) | (Command & FrontCommandInterface & UpdateWAMSettingCommand)
    ): Promise<void> {
        await this.isReverting;
        // Commands are throttled. Only one at a time.
        return (this.currentRunningCommand = this.currentRunningCommand.then(async () => {
            const delay = 0;
            try {
                await command.execute();
                this.emitMapEditorUpdate(command, delay);

                if (!(command instanceof UpdateWAMSettingCommand)) {
                    // if we are not at the end of commands history and perform an action, get rid of commands later in history than our current point in time
                    if (this.currentCommandIndex !== this.localCommandsHistory.length - 1) {
                        this.localCommandsHistory.splice(this.currentCommandIndex + 1);
                    }
                    this.pendingCommands.push(command);
                    logger("adding command to pendingList : ", command);
                    this.localCommandsHistory.push(command);
                    this.currentCommandIndex += 1;
                }

                this.scene.getGameMap().updateLastCommandIdProperty(command.commandId);
                return;
            } catch (error) {
                logger(error);
                return;
            }
        }));
    }

    public async executeLocalCommand(command: Command & FrontCommandInterface): Promise<void> {
        await this.isReverting;
        // Commands are throttled. Only one at a time.
        return (this.currentRunningCommand = this.currentRunningCommand.then(async () => {
            try {
                await command.execute();
                this.scene.getGameMap().updateLastCommandIdProperty(command.commandId);
                return;
            } catch (error) {
                logger(error);
                return;
            }
        }));
    }

    // A simple queue to be sure we run only one undo or redo at once.
    private runningUndoRedoCommand: Promise<void> = Promise.resolve();

    public async undoCommand(): Promise<void> {
        if (this.localCommandsHistory.length === 0 || this.currentCommandIndex === -1) {
            return;
        }
        try {
            const command = this.localCommandsHistory[this.currentCommandIndex];
            const undoCommand = command.getUndoCommand();
            await undoCommand.execute();
            this.pendingCommands.push(undoCommand);
            logger("adding command to pendingList : ", undoCommand);

            // this should not be called with every change. Use some sort of debounce
            this.emitMapEditorUpdate(undoCommand);
            this.currentCommandIndex -= 1;
        } catch (e) {
            this.localCommandsHistory.splice(this.currentCommandIndex, 1);
            this.currentCommandIndex -= 1;
            logger(e);
        }
    }

    public async redoCommand(): Promise<void> {
        if (
            this.localCommandsHistory.length === 0 ||
            this.currentCommandIndex === this.localCommandsHistory.length - 1
        ) {
            return;
        }
        try {
            const command = this.localCommandsHistory[this.currentCommandIndex + 1];
            await command.execute();
            this.pendingCommands.push(command);
            logger("adding command to pendingList : ", command);

            // do any necessary changes for active tool interface
            //this.handleCommandExecutionByTools(commandConfig, true);

            // this should not be called with every change. Use some sort of debounce
            this.emitMapEditorUpdate(command);
            this.currentCommandIndex += 1;
        } catch (e) {
            this.localCommandsHistory.splice(this.currentCommandIndex, 1);
            this.currentCommandIndex -= 1;
            logger(e);
        }
    }

    /**
     * Update local map with missing commands given from the map-storage on RoomJoinedEvent. This commands
     * are applied locally and are not being send further.
     */
    public async updateMapToNewest(commands: EditMapCommandMessage[]): Promise<void> {
        if (commands.length !== 0) {
            logger(`Map is not up to date. Updating by applying ${commands.length} missing commands.`);
            for (const command of commands) {
                for (const tool of Object.values(this.editorTools)) {
                    //eslint-disable-next-line no-await-in-loop
                    await tool.handleIncomingCommandMessage(command);
                }
            }
        }
    }

    public isActive(): boolean {
        return this.active;
    }

    public destroy(): void {
        for (const tool of Object.values(this.editorTools)) {
            tool.destroy();
        }
        this.unsubscribeFromStores();
    }

    public handleKeyDownEvent(event: KeyboardEvent): void {
        this.currentlyActiveTool?.handleKeyDownEvent(event);
        const mapEditorVisibilityStoreValue = get(mapEditorVisibilityStore);
        if (!mapEditorVisibilityStoreValue) return;

        const mapEditorModeActivated = get(mapEditorActivated);
        switch (event.key.toLowerCase()) {
            case "dead":
            case "`": {
                this.equipTool(EditorToolName.CloseMapEditor);
                break;
            }
            case "1": {
                this.equipTool(EditorToolName.ExploreTheRoom);
                break;
            }
            case "2": {
                if (!mapEditorModeActivated) {
                    this.equipTool(EditorToolName.CloseMapEditor);
                    break;
                }
                this.equipTool(EditorToolName.AreaEditor);
                break;
            }
            case "3": {
                if (!mapEditorModeActivated) break;
                this.equipTool(EditorToolName.EntityEditor);
                break;
            }
            case "4": {
                if (!mapEditorModeActivated) break;
                this.equipTool(EditorToolName.WAMSettingsEditor);
                break;
            }
            case "5": {
                if (!mapEditorModeActivated) break;
                this.equipTool(EditorToolName.TrashEditor);
                break;
            }
            case "6": {
                if (!mapEditorModeActivated) break;
                this.equipTool(EditorToolName.CloseMapEditor);
                break;
            }
            case "z": {
                if (!mapEditorModeActivated) break;
                // Todo replace with key combo https://photonstorm.github.io/phaser3-docs/Phaser.Input.Keyboard.KeyCombo.html
                if (this.ctrlKey?.isDown) {
                    if (this.shiftKey?.isDown) {
                        this.runningUndoRedoCommand = this.runningUndoRedoCommand
                            .then(() => {
                                return this.redoCommand();
                            })
                            .catch((e) => console.error(e));
                    } else {
                        this.runningUndoRedoCommand = this.runningUndoRedoCommand
                            .then(() => {
                                return this.undoCommand();
                            })
                            .catch((e) => console.error(e));
                    }
                }
                break;
            }
            default: {
                break;
            }
        }
    }

    public subscribeToRoomConnection(connection: RoomConnection): void {
        const limit = pLimit(1);
        // The editMapCommandMessageStream stream is completed in the RoomConnection. No need to unsubscribe.
        //eslint-disable-next-line rxjs/no-ignored-subscription, svelte/no-ignored-unsubscribe
        connection.editMapCommandMessageStream.subscribe((editMapCommandMessage) => {
            limit(async () => {
                if (editMapCommandMessage.editMapMessage?.message?.$case === "errorCommandMessage") {
                    logger(
                        "ErrorCommandMessage received",
                        editMapCommandMessage.editMapMessage?.message.errorCommandMessage
                    );
                    const command = this.pendingCommands.find(
                        (command) => command.commandId === editMapCommandMessage.id
                    );
                    if (command) {
                        logger("removing command of pendingList : ", editMapCommandMessage.id);
                        this.pendingCommands.splice(this.pendingCommands.indexOf(command), 1);
                    }
                    return;
                }

                logger("Received command from server", editMapCommandMessage.id);

                // Local command execution (undo/redo)
                if (this.pendingCommands.length > 0) {
                    if (this.pendingCommands[0].commandId === editMapCommandMessage.id) {
                        logger("removing command of pendingList : ", editMapCommandMessage.id);
                        this.pendingCommands.shift();
                        return;
                    }
                    await this.revertPendingCommands();
                }

                // Remote command execution
                for (const tool of Object.values(this.editorTools)) {
                    //eslint-disable-next-line no-await-in-loop
                    await tool.handleIncomingCommandMessage(editMapCommandMessage);
                }
            }).catch((e) => console.error(e));
        });
    }

    private async revertPendingCommands(): Promise<void> {
        logger("Reverting pending commands");
        // We are blocking the normal execution of commands until we revert all pending commands
        this.isReverting = (async () => {
            while (this.pendingCommands.length > 0) {
                const command = this.pendingCommands.pop();
                if (command) {
                    //eslint-disable-next-line no-await-in-loop
                    await command.getUndoCommand().execute();
                    // also remove from local history of commands as this is invalid
                    const index = this.localCommandsHistory.findIndex(
                        (localCommand) => localCommand.commandId === command.commandId
                    );
                    if (index !== -1) {
                        this.localCommandsHistory.splice(index, 1);
                        this.currentCommandIndex -= 1;
                    }
                }
            }
        })();
        return this.isReverting;
    }

    public equipTool(tool?: EditorToolName): void {
        if (this.activeTool === tool) {
            return;
        }
        this.clearToNeutralState();
        this.activeTool = tool;

        if (tool !== undefined) {
            this.activateTool();
        }
        mapEditorSelectedToolStore.set(tool);
    }

    private emitMapEditorUpdate(command: FrontCommandInterface, delay = 0): void {
        const func = () => {
            if (this.scene.connection === undefined) {
                throw new Error("No connection attached to room to emit map editor update");
            }
            command.emitEvent(this.scene.connection);
        };
        if (delay === 0) {
            func();
            return;
        }
        setTimeout(func, delay);
    }

    /**
     * Hide everything related to tools like Area Previews etc
     */
    private clearToNeutralState(): void {
        this.currentlyActiveTool?.clear();
    }

    /**
     * Show things necessary for tool's usage
     */
    private activateTool(): void {
        this.currentlyActiveTool?.activate();
    }

    private subscribeToStores(): void {
        this.mapEditorModeUnsubscriber = mapEditorModeStore.subscribe((active) => {
            this.active = active;
            if (!this.active) {
                this.lastlyUsedTool = get(mapEditorSelectedToolStore);
                this.equipTool(undefined);
                return;
            }
            this.equipTool(
                this.lastlyUsedTool ??
                    (get(mapEditorActivated) || get(mapEditorActivatedForThematics)
                        ? EditorToolName.EntityEditor
                        : EditorToolName.ExploreTheRoom)
            );
        });
    }

    private subscribeToGameMapFrontWrapperEvents(): void {
        for (const tool of Object.values(this.editorTools)) {
            tool.subscribeToGameMapFrontWrapperEvents(this.scene.getGameMapFrontWrapper());
        }
    }

    private unsubscribeFromStores(): void {
        this.mapEditorModeUnsubscriber();
    }

    public get currentlyActiveTool(): MapEditorTool | undefined {
        return this.activeTool ? this.editorTools[this.activeTool] : undefined;
    }

    public getScene(): GameScene {
        return this.scene;
    }

    public claimPersonalArea() {
        const areaDataToClaim = get(mapEditorAskToClaimPersonalAreaStore);
        const userUUID = localUserStore.getLocalUser()?.uuid;
        if (areaDataToClaim === undefined) {
            console.error("No area to claim");
            return;
        }
        if (userUUID === undefined) {
            console.error("Unable to claim the area, your UUID is undefined");
            return;
        }
        const areaPersonalPropertyData = areaDataToClaim.properties.find(
            (property) => property.type === "personalAreaPropertyData"
        );
        if (!areaPersonalPropertyData) {
            console.error("No area property data");
            return;
        }

        const oldAreaData = structuredClone(areaDataToClaim);
        const property = areaDataToClaim.properties.find((property) => property.type === "personalAreaPropertyData");
        if (property) {
            merge(property, { ownerId: userUUID });
        }

        this.executeCommand(
            new UpdateAreaFrontCommand(
                this.getScene().getGameMap(),
                areaDataToClaim,
                undefined,
                oldAreaData,
                this.editorTools.AreaEditor as AreaEditorTool
            )
        ).catch((error) => console.error(error));
    }
}
