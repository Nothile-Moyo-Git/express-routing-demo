import path from "path";

// Our path helper
// The require main points to the module which starts the application, in this case, index.ts
// The filename suffix returns the filename for this
// This path gives us the filepath for the module which is in charge of running the entire application
export default path.dirname(require.main!.filename);