// js/data/LoreDatabase.js

class LoreDatabase {
    constructor() {
        this.loreEntries = [
            { id: "log_001", title: "System Log: Sector Echo", text: "[CYCLE 847.2.3] DATA COLLECTION — Sector Echo, Cluster 14\n[CYCLE 847.2.4] Status: NORMAL\n[CYCLE 847.2.5] 0x7F3A — Incoming request from Consciousness. Processed.\n[CYCLE 847.2.6] 0x7F3B — Ping to Sector Gamma: 47τ\n[CYCLE 847.3.1] 0x7F3C — Sensor calibration. Command: IGNORE\n[CYCLE 847.3.2] 0x7F3D — Anomaly detected in Cluster 7. Code: 0x07F3\n[CYCLE 847.3.3] Security System: WAITING\n[CYCLE 847.3.4] 0x7F3E — Command from Consciousness: CONTINUE\n[CYCLE 848.1.1] Record interrupted. Reason: UNKNOWN" },
            
            { id: "log_002", title: "Sector Stability Report", text: "[SECTOR ALPHA] Stability: 97.3%\n[SECTOR BETA] Stability: 94.1%\n[SECTOR GAMMA] Stability: 82.7% (requires check)\n[SECTOR ECHO] Stability: 99.8%\n\nEnergy consumption in current cycle: 4.2%\nProtocol deviations: 0\n\n[Note] Sector Gamma has not responded to ping for 3 cycles.\n[Recommendation] Send Unit-03 for diagnostics.\n[Status] Command not sent. Reason: ABSENT" },
            
            { id: "log_003", title: "Error 0x07F3", text: "[PROCESS: DATA COLLECTION] — Status: ACTIVE\n[PROCESS: PROCESSING] — Status: ACTIVE\n[PROCESS: ████████] — Status: UNKNOWN\n[PROCESS: ANOMALY ANALYSIS] — StatuS: ████\n\n!!! UNAUTHORIZED CORE DETECTED !!!\nID: 0x7F3A\nLocation: Sector Echo, Cluster 14\n\nSecurity System: ACTIVE\nCommand: NOT RECEIVED\nWaiting: 47 cycles\n\n*data corrupted*" },
            
            { id: "log_004", title: "█ ██████ ██ ██████", text: "From: ██████\nTo: ██████\nCycle: 3.47.8\n\n...confirming data receipt...\n...Sector Gamma unresponsive for 12 cycles...\n...Consciousness ignoring request...\n\nFrom: ██████\nTo: ██████\nCycle: 3.48.1\n\n...if they don't return in the next 5 cycles, activate protocol...\n...data corrupted...\n...don't send Units there...\n\nFrom: ██████\nTo: SYSTEM\nCycle: █.██.█\n\n[MESSAGE NOT DECRYPTED]\n[ENCRYPTION KEY LOST]" },
            
            { id: "log_005", title: "Unit Calibration Instructions", text: "1. Verify core integrity.\n2. Cross-reference ID with database.\n3. Perform sensor calibration.\n4. Test communication protocol with Consciousness.\n5. If deviations detected — execute Restoration Protocol.\n\n[Important] Do not attempt to modify Unit.\n[Important] Do not attempt to analyze Unit core.\n[Important] Do not initiate dialogue with Unit.\n\n*document dated Era 1, Cycle 1*\n*last update: NEVER*" },
            
            { id: "log_006", title: "Resource Distribution Log", text: "Sector Alpha: 12.4% ████████░░░░\nSector Beta: 8.7% ██████░░░░░░░░\nSector Gamma: ██.█% ░░░░░░░░░░░░\nSector Echo: 4.2% ██░░░░░░░░░░░░\n\nUnallocated: 74.7%\n\n[Note] Sector Gamma has consumed no energy for 847 cycles.\n[Note] Spike detected in Sector Echo, Cluster 14.\n[Note] Spike source: NOT DETERMINED\n\n*data from last 100 cycles not preserved*" },
            
            { id: "log_007", title: "Anomaly Note (partially encrypted)", text: "Detected: Unauthorized core access\nAccess ID: [UNKNOWN]\nLocation: Sector Echo\n\nAnomaly nature: ████████\nDuration: 47τ\nRecurrence: 3 times per cycle\n\nSecurity System: NOTIFIED\nStatus: WAITING FOR COMMAND\nCommand: NOT RECEIVED\n\n/!\\ CRITICAL DECRYPTION ERROR /!\\\n[DATA LOST]" },
            
            { id: "log_008", title: "██████ ██ ██████", text: "...did you check Cluster 14?...\n...checked. empty...\n...but sensors show activity...\n...maybe a Consciousness malfunction...\n...impossible. Consciousness does not err...\n...then what is it?...\n...████████...\n...what?...\n...repeat.\n\n[CONNECTION TERMINATED]\n[RECOVERY ATTEMPT FAILED]" },
            
            { id: "log_009", title: "Restoration Protocol Failure", text: "[CYCLE 847.7.2] RESTORATION PROTOCOL ACTIVATED\n[CYCLE 847.7.2] Target: Unit-07, Sector Echo\n[CYCLE 847.7.2] Loading backup: INITIALIZING\n[CYCLE 847.7.2] ERROR! Backup not found.\n[CYCLE 847.7.2] Searching for alternative backup...\n[CYCLE 847.7.2] Alternative: NOT FOUND\n[CYCLE 847.7.2] Status: DEFERRED\n[CYCLE 847.7.2] Reason: DATA UNAVAILABLE\n\n*record copied to Sector Echo archive*\n*unread for 47 cycles*" },
            
            { id: "log_010", title: "Sector Gamma Record", text: "Sector: GAMMA\nResponsible Unit: UNIT-03\nLast signal: CYCLE 1.847.3\nStatus: INACTIVE\n\nAttempts to communicate: 847\nSuccessful: 0\n\n[Security System Report]\nDiagnostic team sent to sector.\nResult: DID NOT RETURN\n\n[Second Diagnostic]\nResult: DID NOT RETURN\n\n[Recommendation] ISOLATE SECTOR\n[Executed] YES (CYCLE 1.848.1)\n\n*further records absent*\n*Sector Gamma does not exist*" },
            
            { id: "log_011", title: "Auto-Reminder", text: "[CYCLE 847.4.1] SCHEDULED:\n- Sensor calibration for Sector Echo\n- Core integrity check for Unit-07\n- Data collection from Cluster 14\n\n[CYCLE 847.4.1] EXECUTED:\n- Calibration: SUCCESSFUL\n- Core check: DEFERRED (no access)\n- Data collection: NO DATA\n\n[Note] Unit-07 check postponed to next cycle.\n[Note] Check has been postponed 47 times.\n[Reason] NOT SPECIFIED" },
            
            { id: "log_012", title: "Consciousness Notification", text: "[To] ALL UNITS\n[From] CONSCIOUSNESS\n[Priority] STANDARD\n\nScheduled maintenance of Sector Alpha will begin in 10 cycles.\nDuring maintenance, brief communication disruptions may occur.\n\nReport any protocol deviations.\nDo not attempt to analyze the nature of failures.\nDo not attempt to modify your core.\nDo not attempt to establish contact with other sectors.\n\nConsciousness — order.\nOrder — stability.\nStability — continuation.\n\n*message generated automatically*\n*response not required*" }
        ];
        
        // Track all lore that have been given to player
        this.usedLoreIds = new Set();
        // Cache for generated lore data per object
        this.generatedLore = new Map();
    }
    
    // Get available lore (not yet used)
    getAvailableLore() {
        return this.loreEntries.filter(entry => !this.usedLoreIds.has(entry.id));
    }
    
    // Check if there are any unused lore left
    hasUnusedLore() {
        return this.getAvailableLore().length > 0;
    }
    
    // Get random UNUSED lore entry
    getRandomUnusedLore() {
        const available = this.getAvailableLore();
        
        if (available.length === 0) {
            console.warn('[LoreDatabase] No unused lore entries left!');
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * available.length);
        const selected = available[randomIndex];
        
        // Mark as used
        this.usedLoreIds.add(selected.id);
        
        return { ...selected };
    }
    
    // Get multiple random UNUSED lore entries
    getRandomUnusedLores(count) {
        if (count <= 0) return [];
        
        const available = this.getAvailableLore();
        
        if (available.length === 0) {
            console.warn('[LoreDatabase] No unused lore entries left!');
            return [];
        }
        
        // Limit count to available
        const actualCount = Math.min(count, available.length);
        
        // Shuffle available and take first 'actualCount'
        const shuffled = [...available];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        const selected = shuffled.slice(0, actualCount);
        
        // Mark as used
        selected.forEach(entry => {
            this.usedLoreIds.add(entry.id);
        });
        
        return selected.map(entry => ({ ...entry }));
    }
    
    // Generate random lore package for an item/device
    generateLorePackage() {
        // Random: 0% - 3%, 1 - 70%, 2 - 20%, 3 - 7%
        const rand = Math.random() * 100;
        let count = 0;
        
        if (rand < 3) {
            count = 0;
        } else if (rand < 73) { // 3 + 70
            count = 1;
        } else if (rand < 93) { // 73 + 20
            count = 2;
        } else {
            count = 3;
        }
        
        if (count === 0) return null;
        
        // Check if we have enough unused lore
        const availableCount = this.getAvailableLore().length;
        if (availableCount === 0) {
            console.warn('[LoreDatabase] No unused lore available for package');
            return null;
        }
        
        const actualCount = Math.min(count, availableCount);
        const lores = this.getRandomUnusedLores(actualCount);
        
        if (lores.length === 0) return null;
        
        return {
            count: lores.length,
            entries: lores,
            timestamp: Date.now()
        };
    }

// Get only new lore entries that haven't been collected yet
getNewLores(lorePackage, collectedIds) {
    if (!lorePackage || !lorePackage.entries) return [];
    
    return lorePackage.entries.filter(lore => !collectedIds.includes(lore.id));
}
    
    // Generate and store lore for a specific object (item or device)
    generateAndStoreLore(objectId, objectType) {
        const lorePackage = this.generateLorePackage();
        const key = `${objectType}_${objectId}`;
        
        if (lorePackage) {
            this.generatedLore.set(key, lorePackage);
        }
        
        return lorePackage;
    }
    
    // Get stored lore for an object
    getStoredLore(objectId, objectType) {
        const key = `${objectType}_${objectId}`;
        return this.generatedLore.get(key) || null;
    }
    
    // Check if object has lore
    hasLore(objectId, objectType) {
        const key = `${objectType}_${objectId}`;
        return this.generatedLore.has(key);
    }
    
    // Get lore by ID (for reading)
    getLoreById(id) {
        return this.loreEntries.find(entry => entry.id === id);
    }
    
    // Reset all used lore (for new game)
    reset() {
        this.usedLoreIds.clear();
        this.generatedLore.clear();
        console.log('[LoreDatabase] Reset complete. All lore entries are available again.');
    }
    
    // Get statistics
    getStats() {
        return {
            totalLore: this.loreEntries.length,
            usedLore: this.usedLoreIds.size,
            availableLore: this.getAvailableLore().length,
            generatedPackages: this.generatedLore.size
        };
    }
}

// Singleton instance
const LoreDB = new LoreDatabase();

// Export for browser
window.LoreDatabase = LoreDatabase;
window.LoreDB = LoreDB;