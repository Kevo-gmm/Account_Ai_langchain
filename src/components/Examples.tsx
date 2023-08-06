"use client";
import { useEffect, useState } from "react";
import QAModal from "./QAModal";
import Image from "next/image";
import { Tooltip } from "react-tooltip";
import companion from "../../companions/companions.json";

import { getCompanions } from "./actions";

export default function Examples() {
  const [QAModalOpen, setQAModalOpen] = useState(false);
  const [example, setExample] = useState({ name: "", title: "", imageUrl: "", llm: "", phone: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const companions = await getCompanions();
        // let entries = JSON.parse(companions);
        const compansion = getCompanion();
        setExample(compansion);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Image width={0} height={0} sizes="100vw" className="mx-auto h-32 w-32 flex-shrink-0 rounded-full" src={example.imageUrl} alt="" />
      <div id="ExampleDiv">
        <QAModal open={QAModalOpen} setOpen={setQAModalOpen} example={example} />
      </div>
    </>
  );
}

const getCompanion = () => {
  return companion;
};
