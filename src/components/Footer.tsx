import Button from "@/components/Button";

const Footer = () => {
    return (
        <footer className="w-full">
            <div className="flex justify-between items-center">
                <div className="flex gap-3 items-end">
                    <img src="/logo/sign.svg" alt="Logo" className="h-[100px] dark:invert" />
                    <div className="flex flex-col gap-2">
                        <span className="font-light text-txt-black-prim dark:text-txt-white-prim text-4xl">
                            Gallery
                        </span>
                        <div className="flex flex-col text-txt-black-sec dark:text-txt-white-sec" >
                            <span className="text-[10px] font-light">
                                Product by
                            </span>
                            <a target="_blank" href="https://noflowcharts.com/" rel="noopener noreferrer"
                            className="hover:text-txt-black-prim dark:hover:text-txt-white-prim text-sm font-light transition-all duration-300"
                            >
                                NoFlowCharts
                            </a>
                        </div>
                    </div>
                </div>

                <Button text="Back to top" />
            </div>
        </footer>
    )
}

export default Footer;