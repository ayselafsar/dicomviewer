class CommandsManager {
    constructor() {
        this.context = {};
    }

    set(definitions, extend = false) {
        if (typeof definitions !== 'object') return;

        if (!extend) {
            this.context = {};
        }

        Object.keys(definitions).forEach((command) => {
            this.context[command] = definitions[command];
        });
    }

    register(command, definition) {
        if (typeof definition !== 'object') return;
        this.context[command] = definition;
    }

    setDisabledFunction(command, func) {
        if (!command || typeof func !== 'function') return;
        const definition = this.context[command];
        if (!definition) {
            console.warn(`Trying to set a disabled function to a command "${command}" that was not yet defined`);
        }

        definition.disabled = func;
    }

    getDefinition(command) {
        return this.context[command];
    }

    isDisabled(command) {
        const definition = this.getDefinition(command);
        if (!definition) return false;
        const { disabled } = definition;
        if ((typeof disabled === 'function') && disabled()) return true;
        if ((typeof disabled !== 'function') && disabled) return true;
        return false;
    }

    run(command) {
        const definition = this.getDefinition(command);
        if (!definition) {
            return console.warn(`Command "${command}" not found in current context`);
        }

        const { action, params } = definition;
        if (this.isDisabled(command)) return undefined;
        if (typeof action !== 'function') {
            return console.warn(`No action was defined for command "${command}"`);
        }

        return action(params);
    }
}

export default CommandsManager;
