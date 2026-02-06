import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  // Old user profile type.
  type OldUserProfile = {
    name : Text;
    photo : Storage.ExternalBlob;
    mobile : ?Text;
    gmail : ?Text;
    signupTimestamp : ?Int;
    profileComplete : Bool;
  };

  // Old actor type.
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // New extended user profile type.
  type NewUserProfile = {
    name : Text;
    photo : Storage.ExternalBlob;
    mobile : ?Text;
    gmail : ?Text;
    signupTimestamp : ?Int;
    profileComplete : Bool;
  };

  // New actor type.
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  // Migration function called by the main actor via the with-clause.
  public func run(old : OldActor) : NewActor {
    old;
  };
};
