//cSpell:ignore unfollow, postback, hwid

export type LineSendedData = {
  destination: string;
  events: (
    | MessageElement
    | FollowElement
    | UnFollowElement
    | JoinElement
    | LeaveElement
    | MemberJoinedElement
    | MemberLeftElement
    | PostBackElement
    | BeaconElement
  )[];
};

type ModeType = 'active' | 'standby';

type SourceType = SourceTypeUser | SourceTypeGroup | SourceTypeRoom;
type SourceTypeUser = {
  type: 'user';
  userId: string;
};
type SourceTypeGroup = {
  type: 'group';
  groupId: string;
  userId?: string;
};
type SourceTypeRoom = {
  type: 'room';
  roomId: string;
  userId: string;
};

type ContentProvider = ContentProviderLine | ContentProviderExternal;
type ContentProviderLine = {
  type: 'line';
};
type ContentProviderExternal = {
  type: 'external';
  originalContentUrl: string;
  previewImageUrl: string;
};

export type MessageElement = {
  type: 'message';
  mode: ModeType;
  replyToken: string;
  message:
    | MessageTextElement
    | MessageImageElement
    | MessageVideoElement
    | MessageAudioElement
    | MessageFileElement
    | MessageLocationElement
    | MessageStampElement;
  source: SourceType;
  timestamp: number;
};

type MessageTextElement = {
  type: 'text';
  id: string;
  text: string;
};

type MessageImageElement = {
  type: 'image';
  id: string;
  contentProvider: ContentProvider;
};

type MessageVideoElement = {
  type: 'video';
  id: string;
  contentProvider: ContentProvider;
  duration: number;
};

type MessageAudioElement = {
  type: 'audio';
  id: string;
  contentProvider: {
    type: string;
  };
  duration: number;
};

type MessageFileElement = {
  type: 'file';
  id: string;
  fileName: string;
  fileSize: number;
};

type MessageLocationElement = {
  type: 'location';
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
};

type MessageStampElement = {
  type: 'sticker';
  id: string;
  packageId: string;
  stickerId: string;
  stickerResourceType:
    | 'STATIC'
    | 'ANIMATION'
    | 'SOUND'
    | 'ANIMATION_SOUND'
    | 'POPUP'
    | 'POPUP_SOUND'
    | 'NAME_TEXT'
    | string;
};

type FollowElement = {
  type: 'follow';
  replyToken: string;
  mode: ModeType;
  timestamp: number;
  source: SourceTypeUser;
};

type UnFollowElement = {
  type: 'unfollow';
  mode: ModeType;
  timestamp: number;
  source: SourceTypeUser;
};

type JoinElement = {
  type: 'join';
  replyToken: string;
  mode: ModeType;
  timestamp: number;
  source: SourceTypeGroup;
};

type LeaveElement = {
  type: 'leave';
  replyToken: string;
  mode: ModeType;
  timestamp: number;
  source: SourceTypeGroup;
};

type MemberJoinedElement = {
  type: 'memberJoined';
  replyToken: string;
  mode: ModeType;
  timestamp: number;
  source: SourceTypeGroup;
  joined: {
    members: SourceTypeUser[];
  };
};

type MemberLeftElement = {
  type: 'memberLeft';
  replyToken: string;
  mode: ModeType;
  timestamp: number;
  source: SourceTypeGroup;
  joined: {
    members: SourceTypeUser[];
  };
};

type PostBackElement = {
  type: 'postback';
  replyToken: string;
  mode: ModeType;
  source: SourceTypeUser;
  timestamp: number;
  postback: {
    data: string;
    params:
      | {
          datetime: string;
        }
      | {
          date: string;
        }
      | {
          time: string;
        };
  };
};

type BeaconElement = {
  type: 'beacon';
  replyToken: string;
  mode: ModeType;
  timestamp: number;
  source: SourceTypeUser;
  beacon: {
    hwid: string;
    type: 'enter' | 'banner' | 'stay' | 'leave'; // 'leave' is deprecated
  };
};
