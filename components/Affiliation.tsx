import Color from "color"
import { PartialAffiliation } from "../utils/types"

const light = "#21252E"
const dark = "#879AC3"

const lightColor = Color(light)
const darkColor = Color(dark)

export function AffiliationLabel({ affiliation, onClick }: { affiliation: PartialAffiliation, onClick?: () => void }) {
  const color = Color(affiliation.color)
  const darkContrast = color.contrast(darkColor)
  const lightContrast = color.contrast(lightColor)

  return <div
    className={`badge badge-outline font-semibold tooltip inline-flex ${onClick ? "cursor-pointer" : ""}`}
    style={{ backgroundColor: affiliation.color, color: darkContrast > lightContrast ? dark : light }}
    data-tip={affiliation.description}
    onClick={onClick}
    >
    {affiliation.name}
  </div>
}

export function AffiliationSelector({
  selectedAffiliations,
  setSelected,
  affiliations
}: {
  selectedAffiliations: number[]
  setSelected: (selection: number[]) => void
  affiliations: PartialAffiliation[]
}) {
  return <div className="flex w-full" >
    <div className="flex-grow">
      <div>Available affiliations</div>
      {affiliations.filter(a => !selectedAffiliations.includes(a.id)).map(a => <AffiliationLabel key={a.id} affiliation={a} onClick={() => selectedAffiliations.length < 3 && setSelected([...selectedAffiliations, a.id])} />)}
    </div>
    <div className="divider divider-horizontal" />
    <div className="flex-grow">
      <div>Selected affiliations</div>
      {affiliations.filter(a => selectedAffiliations.includes(a.id)).map(a => <AffiliationLabel key={a.id} affiliation={a} onClick={() => setSelected(selectedAffiliations.filter(x => x != a.id))}/>)}
    </div>
  </div>
}
