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

	const saveOnServer = action(() => {
		userStore.saveOnServer();
	})

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
					className="bg-gray-500 hover:bg-gray-700 text-white p-1 rounded"
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
							className="bg-gray-500 hover:bg-gray-700 text-white p-1 rounded"
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
								<select
									className="border mx-2 p-1 rounded"
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
								<button
									className="bg-gray-500 hover:bg-gray-700 text-white p-1 rounded"
									onClick={() => saveOnServer()}
								>
									Finish
								</button>
							</div>
						) : null
					}
					
					<div
						className="text-black p-1 rounded"
					>
						{userStore.userName}
					</div>
				</div>
				{
					(!userStore.isTaskChosen && !userStore.loading) ? (
						<div className="flex flex-row gap-2">
							<button
								className="bg-gray-500 hover:bg-gray-700 text-white p-1 rounded"
								onClick={() => resetFirebase()}
							>
								Reset All Tasks
							</button>
							<button
								className="bg-gray-500 hover:bg-gray-700 text-white p-1 rounded"
								onClick={() => logout()}
							>
								Logout
							</button>
						</div>
					) : null
				}
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