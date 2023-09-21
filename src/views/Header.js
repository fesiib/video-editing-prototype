import React, { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../hooks/useRootContext";
import { action, set } from "mobx";
import { authStateChanged, signInWithGoogle, signOutFromGoogle } from "../services/firebase";
import NewIntent from "../components/general/NewIntent";

const Auth = observer(function Auth() {
	const { userStore } = useRootContext();

	const login = action(() => {
		signInWithGoogle().then(action(async (result) => {
			const user = result.user;
			const token = result.credential.accessToken;
			console.log(user.displayName);
			userStore.login(user.uid, user.displayName, user.email, token);
		})).catch((error) => {
			console.log(error.message);
		});
	});

	const logout = action(() => {
		signOutFromGoogle().then(action(() => {
			userStore.logout();
		})).catch((error) => {
			console.log(error.message);
		});
	});

	const taskDone = action(() => {
		userStore.taskDone()
	});

	const resetFirebase = action(() => {
		userStore.resetFirebase();
	});

	useEffect(() => {
		authStateChanged(action((user) => {
			if (user) {
				const userId = user.uid;
				const userName = user.displayName;
				const email = user.email;
				const token = user.accessToken;
				userStore.login(userId, userName, email, token);
			} else {
				userStore.logout();
			}
		}));
	}, []);

	return (<div className="flex flex-row m-1 w-full h-8">
		{!userStore.isLoggedIn ? (
			<div className="">
				<button
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 rounded"
					onClick={() => login()}
				>
					Login
				</button>
			</div>
		) : (
			<div className="w-full flex flex-row justify-between gap-2">
				{/* {
					userStore.isTaskChosen && !userStore.loading ? (
						<NewIntent />
					) : null
				} */}
				<div className="flex flex-row gap-2">
					{
						(userStore.isTaskChosen && !userStore.loading) ? (
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 rounded"
							onClick={() => taskDone()}
						>
							{
								userStore.isTutorial ? "Tutorial Done" 
									: `Task ${userStore.taskIdx + 1} (${userStore.videoId}) Done`
							}
						</button>) : null
					}
					{
						(!userStore.isTaskChosen && !userStore.loading) ? (
							<div>
								<button
									className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 rounded"
									onClick={() => resetFirebase()}
								>
									Reset All Tasks
								</button>
								<select
									className="border mx-2 font-bold p-1 rounded"
									onChange={(e) => {
										userStore.setParticipantId(e.target.value);
									}}
									value={userStore.participantId}
								>
									{
										Object.keys(userStore.taskAssignments).map((participantId) => {
											return <option 
												key={`participant-${participantId}`}
												value={participantId}>P-{participantId}</option>
										})
									}
								</select>
							</div>
						) : null
					}
					
					<div
						className="text-black font-bold p-1 rounded"
					>
						{userStore.userName}
					</div>
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 rounded"
						onClick={() => logout()}
					>
						Logout
					</button>
				</div>
			</div>
		)}
	</div>);
});

const Header = observer(function Header() {
	const { userStore, uiStore } = useRootContext();

	return (
		<div className="flex flex-row">
			<Auth />
		</div>
	);
});

export default Header;