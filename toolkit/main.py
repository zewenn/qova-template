import os
import time

import_statements = ""

def auto_import_ts_files(directory):
    global import_statements

    # Get a list of all .ts files in the specified directory
    ts_files = [f for f in os.listdir(directory) if f.endswith(".ts")]
    index_file_path = os.path.join(directory, "index.ts")

    for ts_file in ts_files:
        module_name = ts_file[:-3]  # Remove the .ts extension
        import_statements += f'import "./scripts/{module_name}";\n'

auto_import_ts_files(os.path.join("./source", "scripts"))

with open(os.path.join("./source", "index.ts"), "r+") as indexTS:
    start = time.perf_counter()
    c1 = indexTS.read()
    content = c1.split("/** IMPORT SCRIPTS - START */\n")
    if len(content) < 2:
        print("lol")
        exit(1)

    content = content[1].split("/** IMPORT SCRIPTS - END */")
    if len(content) < 2:
        print("lol1")
        exit(1)
    content = content[0]

    indexTS.truncate(0)
    indexTS.seek(0)
    c1 = c1.replace(
        f"/** IMPORT SCRIPTS - START */\n{content}/** IMPORT SCRIPTS - END */",
        f'/** IMPORT SCRIPTS - START */\n{import_statements}/** IMPORT SCRIPTS - END */',
    )
    indexTS.write(c1)

    print(f"Scripts included in \x1b[33m{((time.perf_counter() - start) * 1000):.5}\x1b[0m ms")
