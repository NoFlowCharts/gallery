export default function Home() {
  return (
    <main className="flex w-full h-screen items-center justify-center">
        <div>
            <h1>

            </h1>
            <div className="flex gap-3 items-end">
                <img src="/logo/sign.svg" alt="Logo" className="h-[300px] dark:invert" />
                <div className="flex flex-col gap-2">
                    <span className="font-light text-txt-black-prim dark:text-txt-white-prim text-[108px]">
                        Gallery
                    </span>
                    <div className="flex flex-col text-txt-black-sec dark:text-txt-white-sec" >
                        <span className="text-[30px] font-light -mb-2">
                            Product by
                        </span>
                        <a target="_blank" href="https://noflowcharts.com/" rel="noopener noreferrer"
                           className="hover:text-txt-black-prim dark:hover:text-txt-white-prim text-[42px] font-light transition-all duration-300"
                        >
                            NoFlowCharts
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
}