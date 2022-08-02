import { Affiliation } from "@prisma/client"
import {
  BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip
} from "chart.js"
import Color from "color"
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Scatter } from "react-chartjs-2"
import { AffiliationLabel } from "../../components/Affiliation"
import { DiscordUser } from "../../components/DiscordAvatar"
import FormattedLink from "../../components/FormattedLink"
import { getExperimentList, prisma } from "../../utils/db"
import { ExperimentData, GOODData, PartialAffiliation, SmallExperimentMeta } from "../../utils/types"
import { copy, download, mergeTemplate } from "../../utils/utils"

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip
)

interface ExperimentMeta {
  name: string
  note: string
  slug: string
  template: GOODData
  active: boolean
  oneShot: boolean
  x?: string
  y?: string
  special: {
    name: string;
    dataLine: [number, number][];
  }[]
}

interface Props {
  next?: SmallExperimentMeta,
  meta: ExperimentMeta,
  prev?: SmallExperimentMeta,
  data: ExperimentData[],
  affiliations: Record<number, PartialAffiliation>
}

const UNSELECTED = {
  label: "Select...",
  value: "UNSELECTED"
}
export default function Experiment({ location, meta, data, next, prev, affiliations }: Props & { location: string }) {
  const desc = `Visualization for the ${meta.name} experiment for the GUOBA project. The GUOBA Project intends to map out how the artifacts of players perform to improve mathematical models/artifact standards for calculations such as the KQMS.`

  const [showLines, setShowLines] = useState(true)
  const [randomColors, setRandomColors] = useState(false)
  const [showSpecialData, setShowSpecialData] = useState(true)
  const [showPercentiles, setShowPercentiles] = useState(true)
  const [showBoth, setShowBoth] = useState(false)
  const [markedUser, setMarkedUser] = useState(UNSELECTED)
  const [percentiles, setPercentiles] = useState([5, 25, 50, 75, 95])
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (toast.length > 0) {
      const id = setTimeout(() => {
        setToast("")
      }, 5000)
      return () => clearTimeout(id)
    }
  }, [toast])

  let shownData = data
  if (showPercentiles && !showBoth)
    shownData = [...data.filter(x => x.id == markedUser.value), ...getPercentiles(data, meta, percentiles)]
  else if (showBoth)
    shownData = [...data, ...getPercentiles(data, meta, percentiles)]

  return (
    <main className="max-w-5xl w-full px-1">
      <Head>
        <title>{`${meta.name} | The GUOBA Project`}</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content={`${meta.name} | The GUOBA Project`} />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href={"/experiments"}>Experiments</Link></li>
          <li>{meta.name}</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold pb-0">
        Experiment: {meta.name}
      </h1>
      <div className="flex justify-between text-base pb-1">
        <div className="px-1">
          {prev && <FormattedLink href={`/experiments/${prev.slug}`} location={location} className="font-bold text-base">
            &larr; {prev.name}
          </FormattedLink>}
        </div>

        <div>
          {next && <FormattedLink href={`/experiments/${next.slug}`} location={location} className="font-bold text-base">
            {next.name} &rarr;
          </FormattedLink>}
        </div>
      </div>

      {!meta.active && <>
        <h3 className="text-4xl font-bold pt-1 text-red-700 dark:text-red-400" id="archived">Archived</h3>
        <p>This template has been archived and will most likely no longer receive updates in the future.</p>
      </>}

      {false && <>
        <h3 className="text-2xl font-bold pt-1" id="archived">Note</h3>
        <p>TODO: Add notes</p>
      </>}

      <h3 className="text-lg font-bold pt-1" id="template">Template</h3>
      <p>The template with assumptions for this experiment can be found TODO: Template.</p>

      <h3 className="text-lg font-bold pt-1" id="results">Results</h3>
      <CheckboxInput label="Show lines" set={setShowLines} value={showLines} />
      {undefined /* TODO */ && <CheckboxInput label="Show special data" set={setShowSpecialData} value={showSpecialData} />}
      <CheckboxInput label="Randomize colors" set={setRandomColors} value={randomColors} />
      <CheckboxInput label="Show percentiles" set={setShowPercentiles} value={showPercentiles} />
      {showPercentiles && <CheckboxInput label="Show both users and percentiles" set={setShowBoth} value={showBoth} />}
      {showPercentiles && <NumberInputList label="Shown percentiles" set={setPercentiles} value={percentiles} defaultValue={50} min={0} max={100} />}
      <SelectInput label="Focused user" set={setMarkedUser} value={markedUser.value} options={[
        UNSELECTED,
        // ...(undefined /* TODO */ && showSpecialData ? (Object.keys(["TODO"]).length == 1 ? Object.keys(["TODO"]) : ["Specials"]) : []),
        ...(showPercentiles ? [{ label: "Percentiles", value: "Percentiles" }] : []),
        ...data.map(x => ({
          label: x.username + "#" + x.tag,
          value: x.id
        })).sort((a, b) => a.label.localeCompare(b.label))
      ]} />
      <UserGraph data={shownData} showLines={showLines} meta={meta} randomColors={randomColors} markedUser={markedUser.value} showSpecialData={showSpecialData} affiliations={affiliations} />
      <button className="bg-blue-600 disabled:bg-gray-900 text-slate-50 disabled:text-slate-400 w-fit px-3 py-1 text-center rounded-lg mt-2 cursor-pointer float-right" onClick={() => {
        download(`${meta.slug}.csv`, "user,affiliation,ar,x,y\n" +
          data.flatMap(u => u.stats.map(d => `${u.username.replace(/,/g, "")}#${u.tag},${u.affiliations.join("/").replace(/,/g, "")},${u.ar},${d.join(",")}`)).join("\n"))
      }}>Export to .csv</button>
      <Leaderboard data={data} markedUser={markedUser.value} meta={meta} affiliations={affiliations} setToast={setToast} />

      <h3 className="text-lg font-bold pt-1" id="disclaimer">Disclaimer</h3>
      <p>This data is gathered from the GUOBA project. Please refer to the <FormattedLink href="/">homepage</FormattedLink> to submit your own data!
      </p>

      {toast.length > 0 &&
        <div className="toast">
          <div className="alert alert-info">
            <div>
              <span>{toast}</span>
            </div>
          </div>
        </div>}
    </main>
  )
}

function UserGraph({ meta, data, showLines, randomColors, showSpecialData, markedUser, affiliations }: { meta: ExperimentMeta, data: ExperimentData[], showLines: boolean, randomColors: boolean, showSpecialData: boolean, markedUser: string, affiliations: Record<number, PartialAffiliation> }) {
  const datasets = (meta.special && showSpecialData) ? Object.entries(meta.special).map(([label, data]) => ({
    label,
    ...getColor({ id: label, stats: [] } as any, affiliations, randomColors, markedUser),
    showLine: true,
    data: data.dataLine.map(([x, y]) => ({ x, y }))
  })) : []

  datasets.push(...data.map(d => ({
    label: d.username,
    data: meta.oneShot && d.ar > 0 ? [{ x: d.ar, y: Math.max(...d.stats.map(([_x, y]) => y)) }] : d.stats.map(([x, y]) => ({ x, y })),
    showLine: showLines,
    ...getColor(d, affiliations, randomColors, markedUser)
  })).sort((a, b) => a.label.localeCompare(b.label)))

  return <div className="w-full bg-slate-800 rounded-xl p-1 my-2 md:my-0 text-white col-start-2">
    <Scatter data={({
      datasets: datasets.map(x => ({ ...x, stepped: "after" }))
    })} options={({
      color: "white",
      backgroundColor: "#333333",
      interaction: {
        mode: "point",
        intersect: false
      },
      scales: {
        yAxes: {
          ticks: {
            color: "white"
          },
          grid: {
            color: "rgb(52,71,102)"
          },
          title: {
            display: true,
            color: "rgb(160,160,160)",
            text: meta.y
          }
        },
        xAxes: {
          ticks: {
            color: "white"
          },
          grid: {
            color: "rgb(52,71,102)"
          },
          title: {
            display: true,
            color: "rgb(160,160,160)",
            text: meta.oneShot ? "Total Adventure XP" : meta.x
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (ti) => `${ti.dataset.label} (${ti.label}, ${ti.formattedValue})`
          }
        }
      }
    })} />
  </div>
}

function Leaderboard({ data, meta, markedUser, affiliations, setToast }: { data: ExperimentData[], meta: ExperimentMeta, markedUser: string, affiliations: Record<number, PartialAffiliation>, setToast: (msg: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [minimumX, setMinimumX] = useState(0)

  return <>
    {!meta.oneShot && <NumberInput label={`Minimum ${meta.x}`} set={setMinimumX} value={minimumX} />}
    <div className="clear-both"></div>
    <table className={`table table-zebra table-compact  table-auto w-full ${expanded || data.length <= 10 ? "" : "cursor-pointer"} my-2 sm:text-base text-sm`} onClick={(e) => setExpanded(true)}>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Total Adventure XP</th>
          <th>Affiliation</th>
          {!meta.oneShot && <th>{meta.x ?? "x"}</th>}
          <th>{meta.y ?? "y"}</th>
          <th>Merged GOOD</th>
        </tr>
      </thead>
      <tbody>
        {data
          .map(c => ({
            ...c,
            bestStats: c.stats.find(x => meta.oneShot || x[0] >= minimumX)
          }))
          .sort((a, b) => {
            const statA = a?.bestStats?.[1]
            if (statA == undefined) return 1

            const statB = b?.bestStats?.[1]
            if (statB == undefined) return -1

            return statB - statA
          })
          .filter((_, i, arr) => expanded ? true : (i < 10))
          .map((c, i) => <tr className={`${markedUser == c.id ? "font-bold" : ""}`} key={i}>
            <td>{`#${i + 1}`}</td>
            <td><DiscordUser user={c} /></td>
            <td>{c.ar.toLocaleString()}</td>
            <td>{c.affiliations.map(a => affiliations[a]).map(a => <AffiliationLabel key={a.id} affiliation={a} />)}</td>
            {!meta.oneShot && <td>{c.bestStats?.[0]?.toLocaleString() ?? "---"}</td>}
            <td>{c.bestStats?.[1]?.toLocaleString() ?? "---"}</td>
            <td><button
              className="btn btn-primary btn-sm"
              onClick={async () => {
                try {
                  setToast("Loading...")
                  copy(JSON.stringify(mergeTemplate(await (await fetch(`/api/good?id=${c.GOODId}`)).json(), meta.template)))
                  setToast("Copied!")
                } catch (error) {
                  setToast(error + "")
                }
              }}
            >
              Copy
            </button></td>
          </tr>)}
        {!expanded && data.length > 10 && <tr className="pr-1 cursor-pointer text-blue-700 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-400 no-underline transition-all duration-200 font-semibold">
          <td colSpan={meta.oneShot ? 6 : 7} style={({ textAlign: "center" })}>Click to expand...</td>
        </tr>}
      </tbody>
    </table>
  </>
}

function CheckboxInput({ value, set, label }: { value: boolean, set: (newValue: boolean) => unknown, label: string }) {
  return <div><label>
    {label}
    <input
      className="checkbox checkbox-sm checkbox-accent ml-1"
      checked={value}
      onChange={(e) => set(e.target.checked)}
      type="checkbox"
    />
  </label></div>
}

function SelectInput({ value, set, label, options }: { value: string, set: (newValue: { value: string; label: string; }) => unknown, options: { value: string, label: string }[], label: string }) {
  return <div><label>
    {label}
    <select
      value={value}
      onChange={e => set(options.find(x => x.value == e.target.value)!)}
      className="m-1 select select-bordered select-sm"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </label></div>
}

function NumberInput({ value, set, label, min, max }: { value: number, set: (newValue: number) => unknown, label: string, min?: number, max?: number }) {
  return <div><label>
    {label}
    <input
      className="input input-sm m-1"
      value={value}
      onChange={(e) => {
        const value = +e.target.value
        set(min && value < min ? min : max && value > max ? max : value)
      }}
      min={min}
      max={max}
      type="number"
    />
    <button className={`${value == min ? "bg-slate-800 text-slate-50" : "bg-red-500 text-slate-50 cursor-pointer"} text-center rounded-lg px-1 inline-block ml-2 md:sr-only`} tabIndex={-1} onClick={() => (min == undefined || value > min) ? set(value - 1) : void 0}>Subtract 1</button>
    <button className={`${value == max ? "bg-slate-800 text-slate-50" : "bg-green-500 text-slate-50 cursor-pointer"} text-center rounded-lg px-1 inline-block ml-2 md:sr-only`} tabIndex={-1} onClick={() => (max == undefined || value < max) ? set(value + 1) : void 0}>Add 1</button>

  </label></div>
}

function NumberInputList({ value, set, label, defaultValue, min, max }: { value: number[], set: (newValue: number[]) => unknown, label: string, defaultValue: number, min?: number, max?: number }) {
  const [target, setTarget] = useState(defaultValue)

  function add(v: number) {
    const newValue = [...value, v].sort((a, b) => a - b).filter((v, i, a) => a.indexOf(v) == i)
    set(newValue)
  }
  function remove(v: number) {
    set(value.filter(v2 => v != v2))
  }

  return <div><label>
    {label}
    <input
      className="input input-sm input-bordered m-1"
      min={min}
      max={max}
      value={target}
      onChange={(e) => {
        const value = +e.target.value
        setTarget(min && value < min ? min : max && value > max ? max : value)
      }}
      onKeyDown={e => {
        if (e.key == "Enter") {
          e.preventDefault()
          add(parseInt(e.currentTarget.value))
        }
      }}
      type="number"
    />
    <button className={"btn btn-success btn-sm normal-case m-1"} tabIndex={-1} onClick={() => add(target)}>Add {target}</button>
    {value.map(v => <button key={v} className={"btn btn-error btn-sm normal-case m-1"} tabIndex={-1} onClick={() => remove(v)}>Remove {v}</button>)}


  </label></div>
}


function getPercentiles(data: ExperimentData[], meta: ExperimentMeta, percents: number[]): ExperimentData[] {
  const percentiles: {
    percentile: number,
    stats: [number, number][]
  }[] = percents.map(i => ({ percentile: i, stats: [] }))

  let xValues = data.flatMap(x => x.stats.map(x => x[0])).filter((v, i, a) => a.indexOf(v) == i).sort((a, b) => a - b)

  if (meta.oneShot)
    xValues = [Math.min(...data.map(x => x.ar)), Math.max(...data.map(x => x.ar))]

  xValues.forEach(x => {
    const values = data.map(u => u.stats.find(s => s[0] >= x || meta.oneShot)).sort((a, b) => (b?.[1] ?? 0) - (a?.[1] ?? 0))

    percentiles.forEach(p => {
      const value = values[Math.floor(values.length * p.percentile / 100)]
      if (value == undefined) return
      if (p.stats.length > 1 && p.stats[p.stats.length - 1]?.[1] == value?.[1])
        p.stats.pop()
      p.stats.push([x, value[1]])
    })
  })

  return percentiles.map(p => ({
    GOODId: 0,
    id: `${p.percentile}%`,
    username: `${p.percentile}%`,
    tag: "", avatar: "",
    affiliations: [-99],
    ar: -1,
    nickname: `${p.percentile}%`,
    stats: p.stats
  }))
}


function getColor(data: ExperimentData, affiliations: Record<number, PartialAffiliation>, randomColors: boolean, markedUser: string) {
  if (data.id == "KQMS") return {
    borderColor: "#9b4fd1",
    backgroundColor: "#d9b8ef",
    borderWidth: data.id == markedUser ? 4 : undefined,
    segment: { borderColor: "#9b4fd1" }
  }

  let base = Color({ r: 201, g: 201, b: 201 }) // gray
  if (data.affiliations.length > 0)
    base = Color(affiliations[data.affiliations[0]]?.color)

  let mult = .2

  if (markedUser == UNSELECTED.value) {
    if (data.ar < 0 && data.affiliations[0] == -99)
      mult = 1.3
    else
      mult = 0.5
  } else if (data.id == markedUser)
    mult = 2

  if (data.ar < 0) {
    base = Color({ r: 177, g: 255, b: 99 }) // specials
    if (data.affiliations[0] == -99) {
      base = Color({ r: 99, g: 255, b: 255 }).darken(parseInt(data.id.replace("%", "")) / 150)
      randomColors = false
      if (markedUser == "Percentiles")
        mult = 2
    } else if (markedUser == "Specials")
      mult = 2
  }

  const a = randomColors ? (Math.random() - 0.5) * 0.6 : 0
  const b = randomColors ? (Math.random() - 0.5) * 0.4 : 0
  const c = randomColors ? (Math.random() - 0.5) * 15 : 0


  return {
    backgroundColor: applyColor(base, a, b, c, 0.6 * mult),
    borderColor: applyColor(base, a, b, c, 1.2 * mult),
    borderWidth: data.id == markedUser ? 5 : undefined,
    segment: { borderColor: applyColor(base, a, b, c, .25 * mult) }
  }
}

function applyColor(base: Color, randomness1: number, randomness2: number, randomness3: number, alpha: number) {
  return base
    .lighten(randomness1)
    .desaturate(randomness2)
    .hue(base.hue() + randomness3)
    .alpha(alpha)
    .toString()
}


export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  try {
    const slug = context.params?.slug
    const experiments = await getExperimentList()

    const index = experiments.findIndex(x => x.slug == slug)
    if (index < 0)
      return {
        notFound: true
      }

    const next = experiments[index + 1] ?? null
    const prev = experiments[index - 1] ?? null
    const data = await prisma.experiment.findUnique({
      where: { slug: slug as string },
      include: {
        staticDataline: {
          select: {
            dataLine: true,
            name: true
          }
        },
        experimentData: {
          include: {
            user: {
              select: { avatar: true, username: true, tag: true, GOODId: true, affiliations: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  description: true,
                }
              }, ar: true }
            }
          }
        }
      }
    })
    if (!data)
      return {
        notFound: true
      }

    const affiliations: Record<number, PartialAffiliation> = {}
    const experimentData = data.experimentData.filter(d => d.GOODId == d.user.GOODId).map(d => ({
      affiliations: d.user.affiliations.map(x => {
        if (!affiliations[x.id]) affiliations[x.id] = x
        return x.id
      }),
      ar: d.user.ar ?? 0,
      username: d.user.username,
      id: d.userId,
      avatar: d.user.avatar,
      tag: d.user.tag,
      GOODId: d.GOODId,
      stats: d.dataLine as [number, number][]
    }))

    return {
      props: {
        prev,
        next,
        meta: {
          name: data.name,
          slug: data.slug,
          active: data.active,
          note: "TODO: Note",
          oneShot: false, // TODO
          special: data.staticDataline.map(d => ({
            name: d.name,
            dataLine: d.dataLine as [number, number][],
          })),
          template: data.template as any as GOODData,
          x: "TODO X",
          y: "TODO Y",
        },
        data: experimentData,
        affiliations
      },
      revalidate: 60 * 60 * 1
    }
  } catch (error) {
    console.error(error)
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const experiments = await getExperimentList()

  return {
    paths: experiments?.map(g => ({
      params: { slug: g.slug }
    })) ?? [],
    fallback: "blocking"
  }
}
