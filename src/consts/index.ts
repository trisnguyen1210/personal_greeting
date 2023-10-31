import { cwd } from 'process';

const templateAudioBasePath = `${cwd()}/template-audio`;

type Constant = {
   templateAudioBasePath: string
   audioBasePath: string
   tempBasePath: string
   backgroundMusicPath: string
   silent1sPath: string
   silent5sPath: string
   silent2sPath: string
   audioText2Path: string
   audioText3Path: string
   audioText4Path: string
   audioText5Path: string
}

const consts: Constant = {
   templateAudioBasePath,
   audioBasePath: `${cwd()}/public/audio`,
   tempBasePath: `${cwd()}/temp`,
   backgroundMusicPath: `${templateAudioBasePath}/background-music.mp3`,
   silent1sPath: `${templateAudioBasePath}/silent-1s.mp3`,
   silent5sPath: `${templateAudioBasePath}/silent-5s.mp3`,
   silent2sPath: `${templateAudioBasePath}/silent-2s.mp3`,
   audioText2Path: `${templateAudioBasePath}/text2.mp3`,
   audioText3Path: `${templateAudioBasePath}/text3.mp3`,
   audioText4Path: `${templateAudioBasePath}/text4.mp3`,
   audioText5Path: `${templateAudioBasePath}/text5.mp3`,
};

export default consts;
