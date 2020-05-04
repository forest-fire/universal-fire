import { RealTimeDB, IFirebaseConfig } from "../../src/index";

export class FakeDB extends RealTimeDB {
  protected _eventManager: any;
  protected _auth: any;
  protected _firestore: any;
  protected _storage: any;
  protected _messaging: any;

  constructor(config: IFirebaseConfig) {
    super();
    this.initialize(config);
  }

  protected async connectToFirebase(config: any) {
    return;
  }

  protected listenForConnectionStatus() {
    //
  }
}
