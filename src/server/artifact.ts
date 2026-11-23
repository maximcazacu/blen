import "server-only";
import { zipSync, strToU8 } from "fflate";
import { compile, validate, version } from "@/domain/workflow";
export function artifact(input:unknown) {
  const {workflow,issues}=validate(input);
  if(!workflow || issues.length) throw new Error("Invalid workflow.");
  const guide=`# ${workflow.name}

## Install

1. Work on a copy of your workbook.
2. Verify your Excel environment supports Office Scripts and your organization enables the Automate tab.
3. Open Automate → New Script → Code Editor and replace its contents with automation.ts.
4. Check that the source worksheet exists. The used range must start with headers followed by data.
5. Review the configured columns, then run and inspect the workbook in your own environment.

The artifact is Office Scripts TypeScript. It can modify workbook data and formatting. An existing table can overlap the selected range, and a report cannot overwrite a worksheet. Synthetic previews are approximate. The package was generated locally and was not executed inside Excel.

## Usage

Local blen. demonstration artifact. Use it for evaluation in an environment you control. Microsoft licensing, tenant policies and service availability apply separately.
`;
  const file = (data:string) => [strToU8(data),{mtime:new Date("2000-01-01T00:00:00Z")}] as [Uint8Array,{mtime:Date}];
  return zipSync({
    "automation.ts":file(compile(workflow)),
    "README.md":file(guide),
    "workflow.json":file(JSON.stringify(workflow,null,2)+"\n"),
    "version.json":file(JSON.stringify({compiler:version,format:1},null,2)+"\n"),
  });
}
