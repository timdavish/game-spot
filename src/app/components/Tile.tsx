import type {TileValue} from '@/app/types'

const getTileBackgroundColor = (tileValue: TileValue) =>
  ({
    0: 'bg-stone-400',
    2: 'bg-amber-200',
    4: 'bg-amber-300',
    8: 'bg-amber-400',
    16: 'bg-amber-500',
    32: 'bg-amber-600',
    64: 'bg-amber-700',
    128: 'bg-amber-800',
    256: 'bg-amber-900',
    512: 'bg-lime-300',
    1024: 'bg-lime-400',
    2048: 'bg-lime-500',
    4096: 'bg-lime-600',
    8192: 'bg-lime-700',
    16384: 'bg-lime-800',
    32768: 'bg-teal-300',
    65536: 'bg-teal-400',
    131072: 'bg-teal-500',
    262144: 'bg-teal-600',
    524288: 'bg-teal-700',
    1048576: 'bg-teal-800',
  })[tileValue]

interface Props {
  value: TileValue
}

const Tile = ({value}: Props) => {
  const tileBackgroundColor = getTileBackgroundColor(value)

  return (
    <div
      className={`grid justify-center items-center w-32 h-32 shadow rounded-lg ${tileBackgroundColor}`}
    >
      {value > 0 ? <p className='text-4xl'>{value}</p> : null}
    </div>
  )
}

export default Tile
