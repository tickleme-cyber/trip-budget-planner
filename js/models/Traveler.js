/**
 * Traveler Class - Demonstrates Encapsulation
 * Represents a traveler participating in a trip.
 */
export class Traveler {
    // Private fields (Encapsulation)
    #id;
    #name;
    #email;
    #color;

    /**
     * @param {string} id - Unique identifier
     * @param {string} name - Traveler name
     * @param {string} email - Traveler email / contact
     * @param {string} color - Avatar badge color
     */
    constructor(id, name, email = '', color = '') {
        if (!name || name.trim() === '') {
            throw new Error('Traveler name cannot be empty');
        }

        this.#id = id || `trv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        this.#name = name.trim();
        this.#email = (email || '').trim();
        this.#color = color || this.#generateColor(this.#name);
    }

    // Getters for encapsulated properties
    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get email() {
        return this.#email;
    }

    get color() {
        return this.#color;
    }

    // Setters with validation
    setName(newName) {
        if (!newName || newName.trim() === '') {
            throw new Error('Traveler name cannot be empty');
        }
        this.#name = newName.trim();
    }

    setEmail(newEmail) {
        this.#email = (newEmail || '').trim();
    }

    getInitials() {
        return this.#name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'TR';
    }

    #generateColor(seed) {
        const palette = [
            '#4F46E5', '#06B6D4', '#10B981', '#F59E0B', 
            '#EC4899', '#8B5CF6', '#14B8A6', '#F43F5E'
        ];
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % palette.length;
        return palette[index];
    }

    toJSON() {
        return {
            id: this.#id,
            name: this.#name,
            email: this.#email,
            color: this.#color
        };
    }

    static fromJSON(data) {
        return new Traveler(data.id, data.name, data.email, data.color);
    }
}
