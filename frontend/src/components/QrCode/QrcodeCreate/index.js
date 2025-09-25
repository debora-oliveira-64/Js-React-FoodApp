import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import styles from "./styles.module.scss";

function Qrcode({ user = { username: "", password: "" } }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const newWord = encodeURI(`${user.username}&&${user.password}`);
    setValue(newWord);
  }, [user]);

  return (
    <div className={styles.qrCodeCreate}>
      <QRCode
        size={256}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        value={value}
        viewBox={`0 0 256 256`}
      />
    </div>
  );
}

export default Qrcode;