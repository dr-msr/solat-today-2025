import { GetSolatResponses } from "@/app/api/getSolat/route"
import { formatHijri } from "@/lib/utils"
import { MinusCircle, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface SolatPanelProps {
    updateTimer : (timer: string | null) => void
    jadualSolat: GetSolatResponses
}

const SolatPanel = ({ jadualSolat, updateTimer }: SolatPanelProps) => {
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [index, setIndex] = useState<number>(new Date().getDay() + 1)
    const [nextPrayer, setNextPrayer] = useState({
        prayer: "",
        time: "",
    })
    const [timerCountdown, setTimerCountdown] = useState('');
    const [pulsateClass, setPulsateClass] = useState('pulsate-indigo');
    const [displayDay, setDisplayDay] = useState<Date>(new Date())

    function convertTime(time: number) {
        const date = new Date(time * 1000);
        const localTimeString = date.toLocaleTimeString(undefined, { hour12: true, hour: 'numeric', minute: 'numeric' });
        return localTimeString;
    }

    function getTimerCountdown(current: number, upcoming: number) {
        const date1 = new Date(current * 1000);
        const date2 = new Date(upcoming * 1000);
        const difference = Math.abs(date1.getTime() - date2.getTime());
        const hours = Math.floor(difference / 3600000);
        const minutes = Math.floor((difference % 3600000) / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        setTimerCountdown(formattedHours + ":" + formattedMinutes + ":" + formattedSeconds);
        const currentPrayer = getCurrentPrayer();
        if (currentPrayer != undefined) {
            updateTimer(currentPrayer);
        }
        if (hours > 0) {
            setPulsateClass('pulsate-indigo-slow');
        } else {
            if (minutes <= 15) {
                setPulsateClass('pulsate-red');
            } else {
                setPulsateClass('pulsate-orange');
            }
        }
    }

    function getCurrentPrayer() {
        const today = (new Date().getDate()) - 1

        if (currentTime != undefined && jadualSolat.prayerTimes[0] != undefined) {
            const comparedTime = currentTime.getTime() / 1000;

            if (comparedTime > jadualSolat.prayerTimes[today].fajr && comparedTime <= jadualSolat.prayerTimes[today].syuruk) {
                return "Fajr"
            } else if (comparedTime > jadualSolat.prayerTimes[today].syuruk && comparedTime <= jadualSolat.prayerTimes[today].dhuhr) {
                return "Dhuha"
            } else if (comparedTime > jadualSolat.prayerTimes[today].dhuhr && comparedTime <= jadualSolat.prayerTimes[today].asr) {
                return "Zuhr"
            } else if (comparedTime > jadualSolat.prayerTimes[today].asr && comparedTime <= jadualSolat.prayerTimes[today].maghrib) {
                return "Asr"
            } else if (comparedTime > jadualSolat.prayerTimes[today].maghrib && comparedTime <= jadualSolat.prayerTimes[today].isha) {
                return "Maghrib"
            } else if (comparedTime > jadualSolat.prayerTimes[today].isha && comparedTime <= jadualSolat.prayerTimes[today + 1].fajr) {
                return "Isha"
            } else if (comparedTime > jadualSolat.prayerTimes[today - 1].isha && comparedTime <= jadualSolat.prayerTimes[today + 1].fajr) {
                return "Isha"
            }
        }
    }

    function getNextPrayer() {
        const today = (new Date().getDate()) - 1

        if (currentTime != undefined && jadualSolat.prayerTimes[0] != undefined) {
            const comparedTime = currentTime.getTime() / 1000;

            if (comparedTime > jadualSolat.prayerTimes[today].fajr && comparedTime <= jadualSolat.prayerTimes[today].dhuhr) {
                setNextPrayer({ prayer: "Dhuhr", time: convertTime(jadualSolat.prayerTimes[today].dhuhr) })
                getTimerCountdown(comparedTime, jadualSolat.prayerTimes[today].dhuhr)

            } else if (comparedTime > jadualSolat.prayerTimes[today].dhuhr && comparedTime <= jadualSolat.prayerTimes[today].asr) {
                setNextPrayer({ prayer: "Asr", time: convertTime(jadualSolat.prayerTimes[today].asr) })
                getTimerCountdown(comparedTime, jadualSolat.prayerTimes[today].asr)

            } else if (comparedTime > jadualSolat.prayerTimes[today].asr && comparedTime <= jadualSolat.prayerTimes[today].maghrib) {
                setNextPrayer({ prayer: "Maghrib", time: convertTime(jadualSolat.prayerTimes[today].maghrib) })
                getTimerCountdown(comparedTime, jadualSolat.prayerTimes[today].maghrib)

            } else if (comparedTime > jadualSolat.prayerTimes[today].maghrib && comparedTime <= jadualSolat.prayerTimes[today].isha) {
                setNextPrayer({ prayer: "Isha", time: convertTime(jadualSolat.prayerTimes[today].isha) })
                getTimerCountdown(comparedTime, jadualSolat.prayerTimes[today].isha)

            } else if (comparedTime > jadualSolat.prayerTimes[today].isha && comparedTime <= jadualSolat.prayerTimes[today + 1].fajr) {
                setNextPrayer({ prayer: "Fajr", time: convertTime(jadualSolat.prayerTimes[today + 1].fajr) })
                getTimerCountdown(comparedTime, jadualSolat.prayerTimes[today + 1].fajr)

            } else {
                setNextPrayer({ prayer: "Fajr", time: convertTime(jadualSolat.prayerTimes[today].fajr) })
                getTimerCountdown(comparedTime, jadualSolat.prayerTimes[today].fajr)
            }
        }

    }

    // Function to handle increasing the index
    const handleIncrementIndex = () => {
        if (jadualSolat.prayerTimes && jadualSolat.prayerTimes.length > index + 1) {
            setIndex(prev => prev + 1);
        }
        
        // Create a new Date object to avoid mutating the original state
        const newDate = new Date(displayDay);
        const currentMonth = newDate.getMonth();
        
        // Increment the date
        newDate.setDate(newDate.getDate() + 1);
        
        // Only update if we're still in the same month
        if (newDate.getMonth() === currentMonth) {
            setDisplayDay(newDate);
        }
    };

    // Function to handle decreasing the index
    const handleDecrementIndex = () => {
        if (index > 0) {
            setIndex(prev => prev - 1);
        }
        
        // Create a new Date object to avoid mutating the original state
        const newDate = new Date(displayDay);
        const currentMonth = newDate.getMonth();
        
        // Decrement the date
        newDate.setDate(newDate.getDate() - 1);
        
        // Only update if we're still in the same month
        if (newDate.getMonth() === currentMonth) {
            setDisplayDay(newDate);
        }
    };

    function countsecond() {
        setCurrentTime(new Date());
        getNextPrayer();
    }
    setTimeout(countsecond, 1000);

    return (
        <div>
            <div className="p-4 flex justify-center items-between border-b">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="text-sm">{currentTime ? currentTime.toLocaleString('default', { weekday: 'long', day: 'numeric', month: 'long' }) + ' - ' + currentTime.toLocaleTimeString(undefined, { hour12: true }) : 'Loading..'} </div>
                    <div className={`text-5xl font-bold mb-1 ${pulsateClass}`}>{timerCountdown}</div>
                </div>
            </div>
            <div className="p-4 flex justify-center items-between border-b bg-gray-50">
                <h4 className="font-semibold text-left mr-auto">Upcoming</h4>
                <div className="self-center">
                    <p className="text-gray-700">{nextPrayer.prayer} at {nextPrayer.time}</p>
                </div>
            </div>
            <div className="p-4 flex justify-center items-between border-b bg-gray-50">
                <h4 className="font-semibold text-left mr-auto">Hijri</h4>
                <p className="text-gray-700">{formatHijri(jadualSolat.prayerTimes[new Date().getDay() + 1].hijri)}</p>
            </div>
            <div className="p-4 flex justify-center items-between border-b bg-gray-50">
                <h4 className="font-semibold text-left mr-auto">Qiblat Bearing</h4>
                <p className="text-gray-700">{jadualSolat.bearing.toFixed(2)}°</p>
            </div>
            <div className="p-4 flexborder-b bg-white rounded-b-lg">
                <h4 className="font-semibold text-left">All Prayers</h4>
                <div className="mx-4 border py-2 px-8 rounded-lg mt-4 flex flex-row items-center justify-between gap-2 text-muted-foreground text-sm">
                    <MinusCircle size={20} className="cursor-pointer hover:text-blue-500" onClick={handleDecrementIndex} />
                    <div className="flex flex-col">
                        <div>{displayDay.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                        <div>{formatHijri(jadualSolat.prayerTimes[index].hijri)}</div>
                    </div>
                    <PlusCircle size={20} className="cursor-pointer hover:fill-current" onClick={handleIncrementIndex} />
                </div>
                <pre className="mx-4 border text-black font-mono text-left py-2 px-8 rounded-lg mt-1 text-sm leading-6">
                    <p className="flex flex-row justify-between">
                        <strong>{'Fajr : '}</strong>
                        {convertTime(jadualSolat.prayerTimes[index].fajr)}
                    </p>
                    <p className="flex flex-row justify-between">
                        <strong>{'Dhuhr : '}</strong>
                        {convertTime(jadualSolat.prayerTimes[index].dhuhr)}
                    </p>
                    <p className="flex flex-row justify-between">
                        <strong>{'Asr : '}</strong>
                        {convertTime(jadualSolat.prayerTimes[index].asr)}
                    </p>
                    <p className="flex flex-row justify-between">
                        <strong>{'Maghrib : '}</strong>
                        {convertTime(jadualSolat.prayerTimes[index].maghrib)}
                    </p>
                    <p className="flex flex-row justify-between">
                        <strong>{'Isha : '}</strong>
                        {convertTime(jadualSolat.prayerTimes[index].isha)}
                    </p>
                </pre>
                <div className="mx-4 border py-2 px-8 rounded-lg mt-1 flex flex-row items-center justify-center gap-2 text-muted-foreground text-sm">
                <Link href={"https://www.e-solat.gov.my/index.php"} target="_blank">{jadualSolat.zon.code} : {jadualSolat.zon.district}</Link>				
                </div>
            </div>
        </div>
    )
}

export default SolatPanel