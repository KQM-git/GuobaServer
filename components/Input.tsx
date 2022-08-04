import { useState } from "react"


export function CheckboxInput({
  value,
  set,
  label,
  labelClass
}: {
  value: boolean,
  set: (newValue: boolean) => unknown,
  label: string,
  labelClass?: string
}) {
  return <label className="cursor-pointer label justify-start p-0 pt-1">
    <span className={labelClass}>{label}</span>
    <input
      type="checkbox"
      className={"checkbox checkbox-sm checkbox-accent ml-1"}
      checked={value}
      onChange={(e) => set(e.target.checked)}
    />
  </label>
}

export function SelectInput<T extends string | number>({ value, set, label, options }: { value: T, set: (newValue: { value: T; label: string | number; }) => unknown, options: { value: T, label: string | number }[], label: string }) {
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

export function NumberInput({ value, set, label, min, max }: { value: number, set: (newValue: number) => unknown, label: string, min?: number, max?: number }) {
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

export function NumberInputList({ value, set, label, defaultValue, min, max }: { value: number[], set: (newValue: number[]) => unknown, label: string, defaultValue: number, min?: number, max?: number }) {
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

export function TextInput({
  value,
  set,
  label,
  labelClass,
  placeholder,
  validation
}: {
  value: string
  set: (newValue: string) => unknown
  label: string
  labelClass?: string
  placeholder?: string
  validation?: (newValue: string) => boolean
}) {
  return <label className={`cursor-pointer label justify-start ${(validation ? validation(value) : value.length > 0) ? "" : "text-error"}`} >
    <span className={labelClass}>{label}</span>
    <input
      type="text"
      className={"input input-bordered input-sm mx-3"}
      value={value}
      placeholder={placeholder}
      onChange={(e) => set(e.target.value)}
    />
  </label>
}
