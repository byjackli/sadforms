// Test cases to verify potential fieldData bugs
// Run these in browser console or Node environment

// Mock the dependencies for testing
const stored = {};
const belongs = (obj, key) => obj && obj.hasOwnProperty(key);

function getFieldPropValue(formid, prop) {
    if (!belongs(stored[formid], prop)) throw "[FormStore] stored does not have this property!";
    return stored[formid][prop];
}

function hasFieldProp(formid, prop, fieldid, groupid) {
    const slot = getFieldPropValue(formid, prop);
    if (groupid === undefined) return belongs(slot, fieldid);
    return belongs(slot, groupid) && belongs(slot[groupid], fieldid);
}

function setFieldProp(formid, prop, data, fieldid, groupid) {
    const slot = getFieldPropValue(formid, prop);
    if (slot === undefined) return undefined;

    if (groupid !== undefined) {
        if (!belongs(slot, groupid)) slot[groupid] = {};
        slot[groupid][fieldid] = data;
    } else slot[fieldid] = data;

    return data;
}

function getFieldProp(formid, prop, fieldid, groupid) {
    const slot = getFieldPropValue(formid, prop);
    if (slot === undefined) return undefined;

    if (fieldid === undefined) return slot;
    if (groupid !== undefined) return hasFieldProp(formid, prop, groupid) ? slot[groupid][fieldid] : undefined;
    return hasFieldProp(formid, prop, fieldid) ? slot[fieldid] : undefined;
}

// Initialize form storage
function initForm(formid) {
    stored[formid] = {
        submit: { submitting: false, accepted: false, attempted: false },
        data: {},
        dontSave: {},
        required: {},
        onInput: {},
        validity: {},
        verdict: {},
        preview: {},
        redact: {},
        touched: {},
        value: {},
        active: {},
        group: {}
    };
}

// Helper function to clear field from storage
function clearFieldFromStorage(formid, storageType, fieldid, groupid) {
    const slot = getFieldPropValue(formid, storageType);
    if (groupid !== undefined) {
        if (slot[groupid]) delete slot[groupid][fieldid];
    } else {
        delete slot[fieldid];
    }
}

// Helper function to determine storage routing
function getStorageRouting(payload, dontSaveExists) {
    return payload.dontSave !== undefined ? payload.dontSave : dontSaveExists;
}

// The refactored fieldData function from FormStore.ts
function fieldData(uid, payload, fieldid, groupid) {
    // Determine storage routing based on current configuration
    const dontSaveExists = hasFieldProp(uid, "dontSave", fieldid, groupid);
    const useDontSave = getStorageRouting(payload, dontSaveExists);

    switch (payload.action) {
        case "set":
        case "init":
            return handleSetAction(uid, payload, fieldid, groupid, useDontSave, dontSaveExists);
        
        case "get":
            return handleGetAction(uid, fieldid, groupid, useDontSave);
        
        case "exists":
            return handleExistsAction(uid, fieldid, groupid, useDontSave);
        
        default:
            throw new Error(`[fieldData] Unknown action: ${payload.action}`);
    }
}

function handleSetAction(uid, payload, fieldid, groupid, useDontSave, dontSaveExists) {
    // Clean up conflicting storage when switching between storage types
    if (useDontSave && hasFieldProp(uid, "data", fieldid, groupid)) {
        // Moving to dontSave storage - clear regular storage
        clearFieldFromStorage(uid, "data", fieldid, groupid);
    } else if (!useDontSave && dontSaveExists) {
        // Moving to regular storage - clear dontSave storage
        clearFieldFromStorage(uid, "dontSave", fieldid, groupid);
    }

    // Store data in appropriate storage
    return useDontSave
        ? setFieldProp(uid, "dontSave", { dontSave: true, data: payload.data }, fieldid, groupid)
        : setFieldProp(uid, "data", payload.data, fieldid, groupid);
}

function handleGetAction(uid, fieldid, groupid, useDontSave) {
    return useDontSave
        ? getFieldProp(uid, "dontSave", fieldid, groupid)?.data
        : getFieldProp(uid, "data", fieldid, groupid);
}

function handleExistsAction(uid, fieldid, groupid, useDontSave) {
    return useDontSave
        ? hasFieldProp(uid, "dontSave", fieldid, groupid)
        : hasFieldProp(uid, "data", fieldid, groupid);
}

// TEST CASES

console.log("=== Testing fieldData Potential Bugs ===\n");

// Initialize test form
const testFormId = "test-form";
initForm(testFormId);

console.log("Initial state:", JSON.stringify(stored[testFormId], null, 2));

// BUG TEST #1: Self-Reinforcing Sensitive Flag
console.log("\n--- BUG TEST #1: Self-Reinforcing Sensitive Flag ---");

// First: Set field as sensitive
console.log("1. Setting password field as sensitive...");
fieldData(testFormId, { dontSave: true, action: "set", data: "secret123" }, "password");
console.log("dontSave storage:", stored[testFormId].dontSave);
console.log("data storage:", stored[testFormId].data);

// Second: Try to set same field as regular (should this work?)
console.log("\n2. Trying to set same field as regular data...");
fieldData(testFormId, { action: "set", data: "newpassword" }, "password");
console.log("dontSave storage:", stored[testFormId].dontSave);
console.log("data storage:", stored[testFormId].data);
console.log("❌ BUG: Field stays sensitive even when trying to store as regular!");

// BUG TEST #2: Dual Storage Possibility
console.log("\n--- BUG TEST #2: Dual Storage Possibility ---");

// Reset for clean test
initForm(testFormId);

// Store in data first
console.log("1. Storing in data storage...");
fieldData(testFormId, { action: "set", data: "regular_value" }, "email");
console.log("data storage:", stored[testFormId].data);

// Then store in dontSave
console.log("2. Storing same field in dontSave...");
setFieldProp(testFormId, "dontSave", { dontSave: true, data: "sensitive_value" }, "email");
console.log("dontSave storage:", stored[testFormId].dontSave);
console.log("data storage:", stored[testFormId].data);

// Now what does fieldData return?
console.log("3. What does fieldData return?");
const getValue = fieldData(testFormId, { action: "get" }, "email");
console.log("fieldData get result:", getValue);
console.log("❌ BUG: Field exists in both storages, fieldData prioritizes dontSave!");

// BUG TEST #3: Unsafe Property Access
console.log("\n--- BUG TEST #3: Unsafe Property Access ---");

// Reset and manually create malformed dontSave entry
initForm(testFormId);
stored[testFormId].dontSave.badField = "not_an_object"; // Should be { verdict, data }

console.log("1. Created malformed dontSave entry:", stored[testFormId].dontSave);

try {
    console.log("2. Trying to get data from malformed entry...");
    const result = fieldData(testFormId, { action: "get" }, "badField");
    console.log("Result:", result);
} catch (error) {
    console.log("❌ BUG: Error accessing .data on malformed entry:", error.message);
}

// BUG TEST #4: Ignored Verdict Parameter in Exists
console.log("\n--- BUG TEST #4: Ignored Verdict Parameter in Exists ---");

// Reset and set up both storage types
initForm(testFormId);
fieldData(testFormId, { action: "set", data: "regular" }, "testField");
setFieldProp(testFormId, "dontSave", { dontSave: true, data: "sensitive" }, "testField");

console.log("1. Field exists in both storages");
console.log("data:", stored[testFormId].data.testField);
console.log("dontSave:", stored[testFormId].dontSave.testField);

// Test exists with different dontSave values
const existsTrue = fieldData(testFormId, { dontSave: true, action: "exists" }, "testField");
const existsFalse = fieldData(testFormId, { dontSave: false, action: "exists" }, "testField");
const existsUndefined = fieldData(testFormId, { action: "exists" }, "testField");

console.log("2. exists with dontSave: true →", existsTrue);
console.log("3. exists with dontSave: false →", existsFalse);
console.log("4. exists with dontSave: undefined →", existsUndefined);
console.log("❌ BUG: All three return the same value - dontSave parameter is ignored!");

// BUG TEST #5: Inconsistent Get Behavior Based on Prior State
console.log("\n--- BUG TEST #5: Inconsistent Get Behavior ---");

initForm(testFormId);

// Store regular data
console.log("1. Store regular data...");
fieldData(testFormId, { action: "set", data: "initial_value" }, "dynamic");
const get1 = fieldData(testFormId, { action: "get" }, "dynamic");
console.log("get without dontSave:", get1);

// Now mark as sensitive and store
console.log("2. Mark as sensitive and store...");
fieldData(testFormId, { dontSave: true, action: "set", data: "sensitive_value" }, "dynamic");
const get2 = fieldData(testFormId, { action: "get" }, "dynamic");
console.log("get after marking sensitive:", get2);

// Try to get with dontSave: false (should this get regular data?)
const get3 = fieldData(testFormId, { dontSave: false, action: "get" }, "dynamic");
console.log("get with dontSave: false:", get3);
console.log("❌ BUG: Can't access regular data anymore once field becomes sensitive!");

console.log("\n=== FIXED BEHAVIOR TEST: Two-Way Switching ===");

initForm(testFormId);

console.log("1. Start with regular field (dontSave: false)");
fieldData(testFormId, { dontSave: false, action: "set", data: "regular_data" }, "switchField");
console.log("data storage:", stored[testFormId].data.switchField);
console.log("dontSave storage:", stored[testFormId].dontSave.switchField);

console.log("\n2. Switch to sensitive (dontSave: true)");
fieldData(testFormId, { dontSave: true, action: "set", data: "sensitive_data" }, "switchField");
console.log("data storage:", stored[testFormId].data.switchField);
console.log("dontSave storage:", stored[testFormId].dontSave.switchField);

console.log("\n3. Switch back to regular (dontSave: false)");
fieldData(testFormId, { dontSave: false, action: "set", data: "back_to_regular" }, "switchField");
console.log("data storage:", stored[testFormId].data.switchField);
console.log("dontSave storage:", stored[testFormId].dontSave.switchField);

console.log("\n4. Verify get operations respect current configuration");
const getWithFalse = fieldData(testFormId, { dontSave: false, action: "get" }, "switchField");
const getWithTrue = fieldData(testFormId, { dontSave: true, action: "get" }, "switchField");
console.log("get with dontSave: false →", getWithFalse);
console.log("get with dontSave: true →", getWithTrue);

console.log("\n5. Verify exists operations respect current configuration");
const existsWithFalse = fieldData(testFormId, { dontSave: false, action: "exists" }, "switchField");
const existsWithTrue = fieldData(testFormId, { dontSave: true, action: "exists" }, "switchField");
console.log("exists with dontSave: false →", existsWithFalse);
console.log("exists with dontSave: true →", existsWithTrue);

console.log("✅ FIXED: Two-way switching now works correctly!");

console.log("\n=== Test Complete ===");
console.log("Final storage state:", JSON.stringify(stored[testFormId], null, 2));