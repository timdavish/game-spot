'use client'

import {GAME_NAME, GRID_HEIGHT, GRID_WIDTH, TILES_HISTORY_SIZE} from '@/app/constants'

import {useCallback, useEffect, useState} from 'react'

import Tile from './Tile'

import type {TileValue} from '@/app/types'

export type SlideDirection = 'left' | 'right' | 'up' | 'down'

export interface SlideValue {
  hasCombined: boolean
  value: TileValue
}

const START_TILES = new Array<TileValue>(GRID_WIDTH * GRID_HEIGHT).fill(0)

const getRandomOpenTileIndex = (tiles: TileValue[]) => {
  const openTiles = tiles.reduce(
    (acc, value, index) => [...acc, ...(value === 0 ? [index] : [])],
    [] as number[]
  )

  const randomIndex = Math.floor(Math.random() * openTiles.length)

  return openTiles[randomIndex]
}

const createRandomTileValue = () => {
  return Math.random() >= 0.8 ? 4 : 2
}

const adjustSlideValueStack = (slideValueStack: SlideValue[], currentValue: TileValue) => {
  if (currentValue !== 0) {
    const slideValue = slideValueStack.pop()

    const currentSlideValue: SlideValue = {
      hasCombined: false,
      value: currentValue,
    }

    if (!!slideValue && !slideValue.hasCombined && slideValue.value === currentValue) {
      const combinedSlideValue: SlideValue = {
        hasCombined: true,
        value: (slideValue.value + currentValue) as TileValue,
      }

      slideValueStack.push(combinedSlideValue)
    } else {
      if (!!slideValue) {
        slideValueStack.push(slideValue)
      }

      slideValueStack.push(currentSlideValue)
    }
  }
}

const TwentyFortyEight = () => {
  const [tiles, setTiles] = useState([...START_TILES])
  const [tilesHistory, setTilesHistory] = useState([] as (typeof tiles)[])
  const [tilesValue, setTilesValue] = useState(0)

  // Track tiles value
  useEffect(() => {
    setTilesValue(tiles.reduce((acc, tile) => acc + tile, 0 as number))
  }, [tiles])

  // Undo
  const handleUndo = useCallback(() => {
    const newTilesHistory = [...tilesHistory]

    if (newTilesHistory.length > 0) {
      const newTiles = newTilesHistory.pop()!

      setTiles(newTiles)
    }
    setTilesHistory(newTilesHistory)
  }, [tilesHistory])

  // Restart
  const handleRestart = useCallback(() => {
    const newTiles = [...START_TILES]

    const randomOpenTileIndex = getRandomOpenTileIndex(newTiles)
    newTiles[randomOpenTileIndex] = createRandomTileValue()

    setTiles(newTiles)
    setTilesHistory([])
  }, [])

  // Initially set up the game
  useEffect(() => {
    handleRestart()
  }, [handleRestart])

  // Slide
  const slide = useCallback(
    (slideDirection: SlideDirection) => {
      const newTiles = [...START_TILES]

      switch (slideDirection) {
        case 'left': {
          for (let row = 0; row < GRID_HEIGHT; row++) {
            const slideValueStack: SlideValue[] = []

            for (let col = 0; col < GRID_WIDTH; col++) {
              const currentValue = tiles[row * GRID_WIDTH + col]

              adjustSlideValueStack(slideValueStack, currentValue)
            }

            for (let i = 0; i < slideValueStack.length; i++) {
              newTiles[row * GRID_WIDTH + i] = slideValueStack[i].value
            }
          }

          break
        }

        case 'right': {
          for (let row = 0; row < GRID_HEIGHT; row++) {
            const slideValueStack: SlideValue[] = []

            for (let col = GRID_WIDTH - 1; col >= 0; col--) {
              const currentValue = tiles[row * GRID_WIDTH + col]

              adjustSlideValueStack(slideValueStack, currentValue)
            }

            for (let i = 0; i < slideValueStack.length; i++) {
              newTiles[row * GRID_WIDTH + GRID_WIDTH - 1 - i] = slideValueStack[i].value
            }
          }

          break
        }

        case 'up': {
          for (let col = 0; col < GRID_WIDTH; col++) {
            const slideValueStack: SlideValue[] = []

            for (let row = 0; row < GRID_HEIGHT; row++) {
              const currentValue = tiles[row * GRID_WIDTH + col]

              adjustSlideValueStack(slideValueStack, currentValue)
            }

            for (let i = 0; i < slideValueStack.length; i++) {
              newTiles[i * GRID_WIDTH + col] = slideValueStack[i].value
            }
          }

          break
        }

        case 'down': {
          for (let col = 0; col < GRID_WIDTH; col++) {
            const slideValueStack: SlideValue[] = []

            for (let row = GRID_HEIGHT - 1; row >= 0; row--) {
              const currentValue = tiles[row * GRID_WIDTH + col]

              adjustSlideValueStack(slideValueStack, currentValue)
            }

            for (let i = 0; i < slideValueStack.length; i++) {
              newTiles[GRID_WIDTH * GRID_HEIGHT - (GRID_WIDTH - col) - i * GRID_WIDTH] =
                slideValueStack[i].value
            }
          }

          break
        }
      }

      const hasTilesChanged = newTiles.some((tile, index) => tiles[index] !== tile)

      if (!hasTilesChanged) {
        return
      }

      const randomOpenTileIndex = getRandomOpenTileIndex(newTiles)
      newTiles[randomOpenTileIndex] = createRandomTileValue()

      setTilesHistory(tilesHistory => [...tilesHistory, tiles].slice(-TILES_HISTORY_SIZE))
      setTiles(newTiles)
    },
    [tiles]
  )

  // Input
  const handleKeyup = useCallback(
    (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA': {
          slide('left')
          break
        }

        case 'ArrowRight':
        case 'KeyD': {
          slide('right')
          break
        }

        case 'ArrowUp':
        case 'KeyW': {
          slide('up')
          break
        }

        case 'ArrowDown':
        case 'KeyS': {
          slide('down')
          break
        }
      }
    },
    [slide]
  )

  useEffect(() => {
    document.addEventListener('keyup', handleKeyup)

    return () => {
      document.removeEventListener('keyup', handleKeyup)
    }
  }, [handleKeyup])

  return (
    <div className='grid justify-items-center'>
      <h1 className='mb-24'>{GAME_NAME}</h1>

      <p className='color-indigo-500 text-sm'>Value: {tilesValue}</p>

      <div className={`grid gap-2 grid-cols-${GRID_WIDTH} mt-4 mb-4`}>
        {tiles.map((value, index) => {
          return <Tile key={index} value={value} />
        })}
      </div>

      <div className='grid grid-flow-col gap-2'>
        <button
          className='bg-indigo-600 text-white text-sm px-3 py-2 rounded-md disabled:opacity-75'
          disabled={tilesHistory.length <= 0}
          onClick={handleUndo}
        >
          Undo
        </button>

        <button
          className='bg-indigo-600 text-white text-sm px-3 py-2 rounded-md'
          onClick={handleRestart}
        >
          Restart
        </button>
      </div>
    </div>
  )
}

export default TwentyFortyEight
