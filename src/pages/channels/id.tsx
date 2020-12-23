import { Skeleton } from "@chakra-ui/react"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { ChevronsRight } from "react-feather"
import { useRecoilValue } from "recoil"
import { scheduleAtom } from "../../atoms/schedule"
import { Player } from "../../components/common/Player"
import { NotFound } from "../../components/global/NotFound"
import { Program } from "../../types/struct"

export const ChannelIdPage: React.FC<{ sid: string }> = ({ sid }) => {
  const channels = useRecoilValue(scheduleAtom)
  const psid = parseInt(sid)
  const channel = channels && channels.find((c) => c.sid === psid)
  if (!channel) return <NotFound />
  const programs = channel.programs
    .filter((p) => p.start)
    .sort((a, b) => (b.start < a.start ? 1 : -1))

  const [onGoingProgram, setOnGoingProgram] = useState<Program | null>(null)
  const [nextProgram, setNextProgram] = useState<Program | null>(null)
  const onGoingProgramStart = dayjs(onGoingProgram?.start).format("HH:mm")
  const onGoingProgramEnd = dayjs(onGoingProgram?.end).format("HH:mm")
  const onGoingProgramDurationInMinutes = (onGoingProgram?.seconds || 0) / 60
  useEffect(() => {
    const updateProgram = () => {
      const now = dayjs()
      const futurePrograms = programs.filter((p) => dayjs(p.end).isAfter(now))
      setOnGoingProgram(futurePrograms.shift() || null)
      setNextProgram(futurePrograms.shift() || null)
    }
    updateProgram()
    const timer = setInterval(updateProgram, 60 * 1000)
    return () => {
      clearInterval(timer)
    }
  }, [channels])
  return (
    <div className="container mx-auto mt-8">
      <Player channel={channel} />
      <div className="my-4">
        <div className="text-xl">
          <Skeleton isLoaded={!!onGoingProgram}>
            {onGoingProgram ? onGoingProgram.fullTitle : "."}
          </Skeleton>
        </div>
        <div className="text-lg">
          <Skeleton isLoaded={!!onGoingProgram}>
            {onGoingProgramStart}〜{onGoingProgramEnd}（
            {onGoingProgramDurationInMinutes}分） / {channel.name}
          </Skeleton>
        </div>
        <div className="items-center">
          Next
          <ChevronsRight className="inline mx-1" size={18} />
          {nextProgram ? (
            nextProgram.fullTitle
          ) : (
            <span className="text-gray-600">不明</span>
          )}
        </div>
      </div>
    </div>
  )
}
