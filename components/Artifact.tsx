/* eslint-disable @next/next/no-img-element */
import { artifactInfo, slotInfo, statInfo } from "../utils/data"
import { IArtifact } from "../utils/types"
import { getRVMax, getRVSum, getRVValue } from "../utils/utils"

export function Artifact({ artifact, debug }: { artifact: IArtifact, debug?: boolean }) {
  return <div className="flex flex-col m-2 w-80 bg-neutral rounded-lg">
    <div className={`relative ${["", "bg-gray-800", "bg-green-800", "bg-blue-800", "bg-purple-800", "bg-amber-800"][artifact.rarity]} text-slate-200 rounded-t-lg`}>
      <div className="p-2 relative z-50">
        <div className="flex flex-row">
          <div className="bg-slate-800 rounded-xl px-1 mr-1">+{artifact.level}</div>
          <div className="font-semibold text-lg bg-slate-800 rounded-xl bg-opacity-30 px-2">{tl(artifact.setKey)}</div>
        </div>
        <div className="opacity-70 text-sm">{tl(artifact.slotKey)}</div>
        <div className="font-semibold text-xl">{tl(artifact.mainStatKey)}</div>
      </div>
      {getImgURL(artifact.setKey, artifact.slotKey) && <div className="absolute h-full right-0 top-0">
        <img className="float-right h-full" src={getImgURL(artifact.setKey, artifact.slotKey)} alt={tl(artifact.setKey)} />
      </div>}
    </div>
    {debug && <div className="flex gap-2 bg-slate-900 justify-center">
      <div>Sum: {getRVSum(artifact).toPrecision(2)}</div>
      <div>Max: {getRVMax(artifact).toPrecision(2)}</div>
      <div>Weighted: {getRVValue(artifact).toPrecision(3)}</div>
    </div>}
    <div className="px-2 py-0.5">
      {artifact.substats.map((s, i) => <div key={i}>{val(s.key, s.value)}</div>)}
    </div>
  </div>
}


function tl(key: string) {
  const slot = slotInfo.find(x => x.slotKey == key)
  if (slot) return slot.tl

  const stat = statInfo.find(x => x.statKey == key)
  if (stat) return stat.tl

  const artifact = artifactInfo.find(x => x.artifactKey == key)
  if (artifact) return artifact.tl

  return `(Unknown) ${key}`
}

function getImgURL(setKey: string, slotKey: string): string | undefined {
  const slot = slotInfo.find(x => x.slotKey == slotKey)
  if (!slot) return undefined

  const artifact = artifactInfo.find(x => x.artifactKey == setKey)
  if (!artifact) return undefined

  return `/img/artifacts/UI_RelicIcon_${artifact.data}_${slot.i}.png`
}

function val(key: string, value: number) {
  if (key.endsWith("_"))
    if (["atk_", "def_", "hp_"].includes(key))
      return `${tl(key.replace("_", ""))}: ${value.toFixed(1)}%`
    else
      return `${tl(key)}: ${value.toFixed(1)}%`
  return `${tl(key)}: ${value.toFixed(0)}`
}
