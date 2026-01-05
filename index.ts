import {
    createClient, login


} from "./src"

import { read, createFolder, deleteFolder, renameFolder, list, writeFile } from "./src/filesystem"
const client = createClient("http://localhost:8888/")
await login("admin", "111111");

writeFile("local://testfolder1/testfile.txt", "Hello World from Light GraphQL Client!")


//console.log(await createFolder("local://testfolder1"));

//renameFolder("local://testfolder1", "renamedfolder");
//console.log(await list("local://"));


